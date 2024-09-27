import React, { useState, useCallback, useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import "./App.css";

interface Suggestion {
  acName: string;
  department: string | null;
}

const App: React.FC = () => {
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [identification, setIdentification] = useState("");
  const [department, setDepartment] = useState<string | null>(null);
  const [thekedaarKaNaam, setThekedaarKaNaam] = useState("");
  const [date, setDate] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const inputRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

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

  const debouncedFetchSuggestions = useCallback(
    debounce(async (text: string) => {
      if (text.length >= 3) {
        try {
          const response = await fetch(
            `http://localhost:7080/api/acNameWithDepartment?keyword=${text}`
          );
          const data = await response.json();
          console.log(data);
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
    setShowDropdown(false);
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
      name: accountName,
      department: department,
      amount: parseFloat(amount),
      acIdentification: identification,
      thekedaarKaNaam: thekedaarKaNaam,
      date: formattedDate,
    };

    try {
      console.log("date : " + payload.date);
      console.log("name : " + payload.name);
      console.log("department : " + payload.department);
      console.log("thekedaarKanaam : " + payload.thekedaarKaNaam);
      console.log("amount : " + payload.amount);
      console.log("identification : " + payload.acIdentification);

      const response = await fetch("http://localhost:7080/api/add", {
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

      // Reset all fields except date
      setAccountName("");
      setAmount("");
      setIdentification("");
      setDepartment(null);
      setThekedaarKaNaam("");
      setSuggestions([]);
      setShowDropdown(false);
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("Failed to submit form");
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
          />

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
          placeholder="Thekedaar ka naam"
          value={thekedaarKaNaam}
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
