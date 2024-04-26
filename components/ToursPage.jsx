"use client";

import { useQuery } from "@tanstack/react-query";
import ToursList from "./ToursList";
import { getAllTours } from "../utils/action";
import { useState } from "react";

const ToursPage = () => {
  const [searchValue, setSearchValue] = useState("");
  const { data, isPending } = useQuery({
    queryKey: ["tours", searchValue],
    queryFn: () => getAllTours(searchValue),
  });

  return (
    <>
      <form className="max-w-lg mb-12">
        <div className="join w-full">
          <input
            type="text"
            placeholder="Enter city or country here..."
            className="input input-bordered join-item w-full"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary join-item"
            disabled={isPending}
            onClick={() => setSearchValue("")}
          >
            {isPending ? "Please wait..." : "Reset"}
          </button>
        </div>
      </form>
      {isPending ? (
        <span className="loading loading-xl"></span>
      ) : (
        <ToursList data={data} />
      )}
    </>
  );
};

export default ToursPage;
