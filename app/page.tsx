"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";

const Home = () => {
  const [inputDisabled, setInputDisabled] = useState(false);
  const [userInput, setUserInput] = useState("");
  const categories = {
    //"Basic chat": "basic-chat",
    "Function calling": "function-calling"
    //"File search": "file-search",
    //All: "all",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    setUserInput("");
    setInputDisabled(true);
  }

  return (
    <main className={styles.main}>
      <div className={styles.title}>
        ACOB AI Assistant
      </div>
      <div className={styles.container}>
        {Object.entries(categories).map(([name, url]) => (
          <a key={name} className={styles.category} href={`/examples/${url}`}>
            {name}
          </a>
        ))}
      </div>
      <input
          type="text"
          className={styles.input}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Username"
        />
        <button
          type="submit"
          className={styles.button}
          disabled={inputDisabled}
        >
          Log in
        </button>
    </main>
  );
};

export default Home;
