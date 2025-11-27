import api, { unwrap } from "../lib/api";

export const getJobs = async (params = {}) => {
  const data = await unwrap(api.get("/jobs", { params }));
  return data.jobs;
};

export const getJobById = async (jobId) => {
  const data = await unwrap(api.get(`/jobs/${jobId}`));
  return data.job;
};

export const getJobsByUserEmail = async (email) => {
  const data = await unwrap(api.get(`/jobs/user/${email}`));
  return data.jobs;
};

export const searchJobs = async (query) => {
  const data = await unwrap(api.get("/jobs/search", { params: { q: query } }));
  return data.jobs;
};

export const createJob = async (jobData) => {
  const data = await unwrap(api.post("/jobs", jobData));
  return data.job;
};

export const updateJob = async (jobId, jobData) => {
  const data = await unwrap(api.patch(`/jobs/${jobId}`, jobData));
  return data.job;
};

export const deleteJob = async (jobId) => {
  await unwrap(api.delete(`/jobs/${jobId}`));
  return true;
};
