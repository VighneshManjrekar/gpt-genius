"use server";
import OpenAI from "openai";
import prisma from "./db";
import { revalidatePath } from "next/cache";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

export const generateChatResponse = async (chatMsgs) => {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "you are helpful assistant",
        },
        ...chatMsgs,
      ],
      model: "gpt-3.5-turbo",
      temperature: 0,
      max_tokens: 100,
    });
    return {
      message: response.choices[0].message,
      tokens: response.usage.total_tokens,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const generateTourResponse = async ({
  city,
  country,
  travellingWith,
}) => {
  console.log(city, country, travellingWith);
  const query = `Find a exact ${city} in this exact ${country}.
If ${city} and ${country} exist, create a list of things can do in this ${city},${country} if travelling ${travellingWith}. 
Once you have a list, create a one-day tour. Response should be  in the following JSON format: 
{
  "tour": {
    "city": "${city}",
    "country": "${country}",
    "title": "title of the tour",
    "description": "short description of the city and tour",
    "stops": ["short paragraph on the stop 1 ", "short paragraph on the stop 2","short paragraph on the stop 3"]
  }
}
"stops" property should include only three stops.
If you can't find info on exact ${city}, or ${city} does not exist, or it's population is less than 1, or it is not located in the following ${country},   return { "tour": null }, with no additional characters.`;
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "you are a tour guide",
        },
        { role: "user", content: query },
      ],
      model: "gpt-3.5-turbo",
      temperature: 0,
    });
    const tourData = JSON.parse(response.choices[0].message.content);
    if (!tourData.tour) {
      return null;
    }
    console.log({
      tourData: tourData.tour,
      tokens: response.usage.total_tokens,
    });
    return { tourData: tourData.tour, tokens: response.usage.total_tokens };

    return tourData.tour;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getExistingTour = async ({ city, country, travellingWith }) => {
  return prisma.tour.findUnique({
    where: {
      city_country_travellingWith: {
        country: country.toLowerCase(),
        city: city.toLowerCase(),
        travellingWith,
      },
    },
  });
};

export const createNewTour = async (tour) => {
  return prisma.tour.create({
    data: {
      ...tour.tourData,
      travellingWith: tour.travellingWith,
      country: tour.tourData.country.toLowerCase(),
      city: tour.tourData.city.toLowerCase(),
    },
  });
};

export const getAllTours = async (searchTerm) => {
  if (!searchTerm) {
    const tours = await prisma.tour.findMany({
      orderBy: {
        city: "asc",
      },
    });
    return tours;
  }
  const tours = await prisma.tour.findMany({
    where: {
      OR: [
        {
          city: {
            contains: searchTerm,
          },
        },
        {
          country: {
            contains: searchTerm,
          },
        },
      ],
    },
    orderBy: {
      city: "asc",
    },
  });
  return tours;
};

export const getSingleTour = async (id) => {
  return prisma.tour.findUnique({
    where: {
      id,
    },
  });
};

export const generateTourImage = async ({ city, country }) => {
  try {
    const tourImg = await openai.images.generate({
      prompt: `a panaromic view of ${city}, ${country}`,
      n: 1,
      size: "512x512",
    });
    return tourImg?.data[0]?.url;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const fetchUserTokensById = async (clerkId) => {
  const result = await prisma.token.findUnique({
    where: {
      clerkId,
    },
  });
  return result?.tokens;
};

export const generateUserTokensForId = async (clerkId) => {
  const result = await prisma.token.create({
    data: {
      clerkId,
    },
  });
  return result?.tokens;
};

export const fetchOrGenerateTokens = async (clerkId) => {
  const existingUser = await fetchUserTokensById(clerkId);
  if (!existingUser) {
    const newUser = await generateUserTokensForId(clerkId);
    return newUser;
  }
  return existingUser;
};

export const subtractTokens = async (clerkId, tokensUsed) => {
  const result = await prisma.token.update({
    where: {
      clerkId,
    },
    data: {
      tokens: {
        decrement: tokensUsed,
      },
    },
  });
  revalidatePath("/profile");
  return result?.tokens;
};
