"use client";
import Link from "next/link";

const TourCard = ({ tourInfo }) => {
  console.log(tourInfo);
  const { city, id, country, travellingWith } = tourInfo;

  const travellingWithEnum =
    travellingWith == "family"
      ? "with family"
      : travellingWith == "solo"
      ? "solo"
      : travellingWith == "partner"
      ? "with partner"
      : "with friends";

  return (
    <Link
      href={`/tours/${id}`}
      className="card card-compact rounded-xl bg-base-100"
    >
      <div className="card-body items-center text-center">
        <h2 className="card-title text-center">
          Tour to travel {travellingWithEnum} in&nbsp;
          {city.charAt(0).toUpperCase() + city.slice(1)},&nbsp;
          {country.charAt(0).toUpperCase() + country.slice(1)}.
        </h2>
      </div>
    </Link>
  );
};

export default TourCard;
