import React, { useState, useCallback, useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import "./App.css"; // Add your CSS here

interface Suggestion {
  acName: string;
  department: string | null;
}

const App: React.FC = () => {
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [identification, setIdentification] = useState("");
  const [department, setDepartment] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]); // Store suggestions
  const [showDropdown, setShowDropdown] = useState(false); // Control visibility of the dropdown

  const inputRef = useRef<HTMLDivElement>(null); // Ref for the input and dropdown wrapper

  const departments = [
    { label: "Packing", value: "packing" },
    { label: "Dispatch", value: "dispatch" },
    { label: "Control", value: "control" },
    { label: "Coding", value: "coding" },
    { label: "Engineering", value: "engineering" },
    { label: "Electrical", value: "electrical" },
    { label: "Finance", value: "finance" },
    { label: "HR", value: "hr" },
    { label: "Miscellaneous", value: "miscellaneous" },
    { label: "Administration", value: "administration" },
    { label: "Mother Dairy", value: "mother dairy" },
    { label: "MIS", value: "mis" },
    { label: "ETP", value: "etp" },
  ];

  // Debounce the API call to prevent excessive requests
  const debouncedFetchSuggestions = useCallback(
    debounce(async (text: string) => {
      if (text.length >= 3) {
        try {
          const response = await fetch(
            `http://3.84.12.30:7080/api/acNameWithDepartment?keyword=${text}`
          );
          const data = await response.json();
          console.log(data);
          setSuggestions(data || []); // Set suggestions
          setShowDropdown(true); // Show dropdown when suggestions are available
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        }
      } else {
        setSuggestions([]); // Clear suggestions if input is less than 3 characters
        setShowDropdown(false); // Hide dropdown
      }
    }, 300),
    []
  );

  // Handle input change to update the accountName and trigger the API call
  const handleInputChange = (text: string) => {
    setAccountName(text); // Update the input field
    debouncedFetchSuggestions(text); // Trigger the debounced API call
  };

  // Handle when the user clicks on a suggestion
  const handleSuggestionClick = (suggestion: Suggestion) => {
    setAccountName(suggestion.acName); // Set account name to clicked suggestion
    setDepartment(suggestion.department); // Optionally set the department
    setShowDropdown(false); // Hide the dropdown after selecting
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: accountName,
      department: department,
      amount: parseFloat(amount), // Ensure amount is a number
      acIdentification: identification,
    };

    try {
      const response = await fetch("http://3.84.12.30:7080/api/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // Convert the payload to JSON string
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);
      alert("Form submitted successfully");

      // Reset the form fields after submission
      setAccountName("");
      setAmount("");
      setIdentification("");
      setDepartment(null);
      setSuggestions([]); // Clear suggestions if you want
      setShowDropdown(false); // Hide dropdown if visible
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("Failed to submit form");
    }
  };

  // Close the dropdown if clicked outside the input field or suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false); // Hide dropdown
      }
    };

    // Attach event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [inputRef]);

  return (
    <div className="container">
      <header>
        <h1>Account Manager</h1>
      </header>
      <form onSubmit={handleSubmit}>
        <div className="input-wrapper" ref={inputRef}>
          <input
            type="text"
            placeholder="Account Holder"
            value={accountName}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setShowDropdown(true)} // Show dropdown on focus
          />
          {/* Dropdown for suggestions */}
          {showDropdown && suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="suggestion-item"
                >
                  {suggestion.acName} ({suggestion.department})
                </li>
              ))}
            </ul>
          )}
        </div>

        <select
          value={department || ""}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="" disabled>
            Select Department
          </option>
          {departments.map((dept, idx) => (
            <option key={idx} value={dept.value}>
              {dept.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Identification"
          value={identification}
          onChange={(e) => setIdentification(e.target.value)}
        />
        <button type="submit">SUBMIT</button>
      </form>
    </div>
  );
};

export default App;
