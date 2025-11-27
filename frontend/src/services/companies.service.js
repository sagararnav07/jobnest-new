import api, { unwrap } from "../lib/api";

export const getCompanies = async (verified = true) => {
  const data = await unwrap(api.get("/users/companies", { params: { verified } }));
  return data.companies;
};

export const getCompanyById = async (companyId) => {
  const data = await unwrap(api.get(`/users/companies/${companyId}`));
  return data.company;
};

export const getChatUsers = async () => {
  const data = await unwrap(api.get("/users/chat-users"));
  return data.users;
};

export const getChatUserById = async (userId) => {
  const data = await unwrap(api.get(`/users/chat-users/${userId}`));
  return data.user;
};
