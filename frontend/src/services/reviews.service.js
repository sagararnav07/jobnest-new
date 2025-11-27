import api, { unwrap } from "../lib/api";

export const createReview = async (reviewData) => {
  const data = await unwrap(api.post("/reviews", reviewData));
  return data.review;
};

export const deleteReview = async (reviewId) => {
  await unwrap(api.delete(`/reviews/${reviewId}`));
  return true;
};

export const getReviewsByUser = async (userId) => {
  const data = await unwrap(api.get(`/reviews/user/${userId}`));
  return data.reviews;
};

export const getReviewsForCompany = async (companyId) => {
  const data = await unwrap(api.get(`/reviews/company/${companyId}`));
  return data.reviews;
};
