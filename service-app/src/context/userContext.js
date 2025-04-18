import { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDivision, setActiveDivisionState] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (storedToken && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setToken(storedToken);

      if (parsedUser.divisionIDs && parsedUser.divisionIDs.length > 0) {
        const savedDivisionID = parseInt(localStorage.getItem("activeDivisionID"));
        let index = parsedUser.divisionIDs.indexOf(savedDivisionID);

        if (index === -1) index = 0;

        setActiveDivisionState({
          id: parsedUser.divisionIDs[index],
          name: parsedUser.divisionNames[index],
        });
      }
    }

    setLoading(false);
  }, []);

  const setActiveDivision = ({ id, name }) => {
    setActiveDivisionState({ id, name });
    localStorage.setItem("activeDivisionID", id);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        activeDivision,
        setActiveDivision,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export default UserContext;
