"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExistingTour,
  generateTourResponse,
  createNewTour,
  fetchUserTokensById,
  subtractTokens,
} from "../utils/action";
import TourInfo from "./TourInfo";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";

const NewTour = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const {
    mutate,
    isPending,
    data: tour,
  } = useMutation({
    mutationFn: async (destination) => {
      const { travellingWith } = destination;
      const travellingWithEnum =
        travellingWith == "with family"
          ? "family"
          : travellingWith == "solo"
          ? "solo"
          : travellingWith == "with partner"
          ? "partner"
          : "friends";

      const existingTour = await getExistingTour({
        ...destination,
        travellingWith: travellingWithEnum,
      });
      if (existingTour) {
        return existingTour;
      }
      const currentTokens = await fetchUserTokensById(userId);
      if (currentTokens < 300) {
        toast.error("Tokens balanced too low!");
        return;
      }
      const newTour = await generateTourResponse(destination);
      if (!newTour) {
        toast.error("No matching city found...");
        return null;
      }
      await createNewTour({
        ...newTour,
        travellingWith: travellingWithEnum,
      });
      queryClient.invalidateQueries({ queryKey: ["tours"] });
      const newToken = await subtractTokens(userId, newTour.tokens);
      toast.success(`${newToken} remaining`);
      return newTour.tourData;
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const destination = Object.fromEntries(formData.entries());
    mutate(destination);
  };

  if (isPending) return <span className="loading loading-lg"></span>;

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <h2 className="mb-4">Select your deram destination</h2>
        <div className="join w-full">
          <input
            type="text"
            className="input input-bordered join-item w-full"
            placeholder="City"
            name="city"
            required
          />
          <input
            type="text"
            className="input input-bordered join-item w-full"
            placeholder="Country"
            name="country"
            required
          />
          <select
            className="select select-bordered join-item w-full max-w-xs"
            name="travellingWith"
            required
          >
            <option disabled selected>
              Who are you travelling with?
            </option>
            <option value="with family">Family with parents</option>
            <option value="solo">Solo</option>
            <option value="with partner">Partner</option>
            <option value="with friends">Friends</option>
          </select>
          <button className="btn btn-primary join-item" type="submit">
            Generate Tour
          </button>
        </div>
      </form>
      <div className="mt-16">{tour ? <TourInfo tour={tour} /> : null}</div>
    </>
  );
};

export default NewTour;
