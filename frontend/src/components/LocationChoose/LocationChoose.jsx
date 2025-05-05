import React, { useState, useEffect } from "react";
import "./LocationChoose.scss";
const LocationChoose = ({ locations, handleSelectLocation }) => {
  const [searchInput, setSearchInput] = useState("");
  const [filteredLocations, setFilteredLocations] = useState(locations);

  useEffect(() => {
    const lowercasedInput = searchInput.toLowerCase();
    setFilteredLocations(
      locations.filter((location) =>
        location.name.toLowerCase().includes(lowercasedInput)
      )
    );
  }, [searchInput, locations]);

  return (
    <div
      className="location-choose"
      onClick={(e) => e.stopPropagation()} // Prevent event propagation to parent
    >
      <div className="search-bar">
        <div className="search-bar-inner">
          <input
            type="text"
            placeholder="Search. . ."
            value={searchInput}
            onChange={(e) => {
              e.stopPropagation();
              setSearchInput(e.target.value);
            }}
          />
          <button className="search-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.6682 11.6641L14.6682 14.6641"
                stroke="#dc2626"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M13.3362 7.33203C13.3362 4.01832 10.6499 1.33203 7.33618 1.33203C4.02247 1.33203 1.33618 4.01832 1.33618 7.33203C1.33618 10.6457 4.02247 13.332 7.33618 13.332C10.6499 13.332 13.3362 10.6457 13.3362 7.33203Z"
                stroke="#dc2626"
                stroke-width="1.5"
                stroke-linejoin="round"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      <div className="location-options">
        {filteredLocations.map((location) => (
          <div
            className="location-option"
            key={location.id}
            onClick={(e) => {
              e.stopPropagation();
              handleSelectLocation(location);
            }}
          >
            {location?.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationChoose;
