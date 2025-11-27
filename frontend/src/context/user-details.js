import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "./user-context";
import { getCurrentUser } from "../services/auth.service";

export const UserDetailsContext = createContext({
  details: "",
  setDetails: () => {},
});

export const UserDetailsProvider = ({ children }) => {
  const [details, setDetails] = useState({});

  const { currentUser } = useContext(UserContext);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!currentUser) {
        setDetails({});
        return;
      }
      try {
        const userData = await getCurrentUser();
        setDetails(userData);
      } catch (error) {
        console.error(error);
        setDetails({});
      }
    };
    fetchDetails();
  }, [currentUser]);

  const value = { details, setDetails };
  return (
    <UserDetailsContext.Provider value={value}>
      {children}
    </UserDetailsContext.Provider>
  );
};
