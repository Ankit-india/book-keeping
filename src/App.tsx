import React, { useState, useCallback, useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import "./App.css";

interface Suggestion {
  acName: string;
  department: string | null;
  thekedaarKaNaam: string | null;
  acIdentification: string | null;
  id: string | null;
}

const App: React.FC = () => {
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [identification, setIdentification] = useState("");
  const [department, setDepartment] = useState<string | null>(null);
  const [thekedaarKaNaam, setThekedaarKaNaam] = useState<string | null>(null);
  const [date, setDate] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const accountNameInputRef = useRef<HTMLInputElement>(null);

  const departments = [
    { label: "Packing", value: "packing" },
    { label: "Dispatch", value: "dispatch" },
    { label: "Control", value: "control" },
    { label: "Coding", value: "coding" },
    { label: "Refrigeration", value: "refrigeration" },
    { label: "Engineering", value: "engineering" },
    { label: "Electrical", value: "electrical" },
    { label: "Finance", value: "finance" },
    { label: "Housekeeping", value: "housekeeping" },
    { label: "Miscellaneous", value: "miscellaneous" },
    { label: "Administration", value: "administration" },
    { label: "Mother Dairy", value: "mother dairy" },
    { label: "MIS", value: "mis" },
    { label: "ETP", value: "etp" },
    { label: "Workshop", value: "workshop" },
    { label: "Lab", value: "lab" },
    { label: "Production", value: "production" },
    { label: "Boiler", value: "boiler" },
    { label: "Store", value: "store" },
    { label: "TTO", value: "tto" },
    { label: "Test", value: "test" },
  ];

  const apiUrl = "http://192.168.1.7:7080";

  const debouncedFetchSuggestions = useCallback(
    debounce(async (text: string) => {
      if (text.length >= 3) {
        try {
          console.log(`Fetching suggestions for: ${text}`);
          const response = await fetch(
            `${apiUrl}/api/acNameWithDepartment?keyword=${text}`
          );
          const data = await response.json();
          console.log("Suggestions data:", data);
          setSuggestions(data || []);
          setShowDropdown(true);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (text: string) => {
    setAccountName(text);
    debouncedFetchSuggestions(text);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setAccountName(suggestion.acName);
    setDepartment(suggestion.department);
    setIdentification(suggestion.acIdentification ?? "");
    setThekedaarKaNaam(suggestion.thekedaarKaNaam ?? "");
    setId(suggestion.id); // Set the id
    setShowDropdown(false);
    setHighlightedIndex(-1); // Reset the highlighted index
  };

  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedDate = formatDate(date);

    const payload = {
      id: id, // Include the id in the payload
      name: accountName,
      department: department,
      amount: parseFloat(amount),
      accountIdentifier: identification,
      thekedaarKaNaam: thekedaarKaNaam,
      date: formattedDate,
    };

    try {
      console.log("date : " + payload.date);
      console.log("name : " + payload.name);
      console.log("department : " + payload.department);
      console.log("thekedaarKaNaam : " + payload.thekedaarKaNaam);
      console.log("amount : " + payload.amount);
      console.log("identifier : " + payload.accountIdentifier);
      console.log("id : " + payload.id); // Log the id

      const response = await fetch(`${apiUrl}/api/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);
      alert("Form submitted successfully");

      // Reset all fields except date and thekedaarKaNaam
      setAccountName("");
      setAmount("");
      setIdentification("");
      setDepartment(null);
      setSuggestions([]);
      setThekedaarKaNaam("");
      setShowDropdown(false);
      setId(null); // Reset the id

      // Move cursor to account name input field
      accountNameInputRef.current?.focus();
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("Failed to submit form");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showDropdown && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prevIndex) =>
          prevIndex === suggestions.length - 1 ? 0 : prevIndex + 1
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prevIndex) =>
          prevIndex <= 0 ? suggestions.length - 1 : prevIndex - 1
        );
      } else if (e.key === "Enter") {
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          e.preventDefault();
          handleSuggestionClick(suggestions[highlightedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowDropdown(false);
        setHighlightedIndex(-1); // Reset the highlighted index
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [inputRef]);

  useEffect(() => {
    if (showDropdown && suggestions.length > 0) {
      setHighlightedIndex(0); // Set the initial highlighted index when dropdown is shown
    }
  }, [showDropdown, suggestions]);

  return (
    <div className="container">
      <header>
        <h1>कैंटीन का हिसाब</h1>
      </header>
      <form onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <div
            className="date-picker-wrapper"
            onClick={() => dateInputRef.current?.focus()}
          >
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              ref={dateInputRef}
              required
              className="date-input"
            />
            <span className="calendar-icon">📅</span>
          </div>
        </div>

        <div className="input-wrapper" ref={inputRef}>
          <input
            type="text"
            placeholder="Account Holder"
            value={accountName}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            ref={accountNameInputRef} // Attach the ref here
            onKeyDown={handleKeyDown} // Add the onKeyDown handler here
          />

          {showDropdown && suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`suggestion-item ${
                    highlightedIndex === idx ? "highlighted" : ""
                  }`}
                >
                  {`${suggestion.acName} (${
                    suggestion.acIdentification || ""
                  }, ${suggestion.department || ""})`}
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
          placeholder="Thekedaar ka naam"
          value={thekedaarKaNaam ?? ""}
          onChange={(e) => setThekedaarKaNaam(e.target.value)}
        />

        <input
          type="number"
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
