"use client";

import { BsMoonFill, BsSunFill } from "react-icons/bs";
import { useState } from "react";

const themes = {
  light: "winter",
  dark: "dracula",
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(themes.light);

  const toggleTheme = () => {
    const newTheme = theme == themes.light ? themes.dark : themes.light;
    document.documentElement.setAttribute("data-theme", newTheme);
    setTheme(newTheme);
  };

  return (
    <button className="btn btn-outline btn-sm" onClick={toggleTheme}>
      {theme == themes.light ? (
        <BsMoonFill className="h-4 w-4" />
      ) : (
        <BsSunFill className="h-4 w-4" />
      )}
    </button>
  );
};

export default ThemeToggle;
