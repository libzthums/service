import { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDivision, setActiveDivision] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (storedToken && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setToken(storedToken);

      if (parsedUser.divisionIDs && parsedUser.divisionIDs.length > 0) {
        const savedDivisionID = localStorage.getItem("activeDivisionID");
        const index = savedDivisionID
          ? parsedUser.divisionIDs.indexOf(parseInt(savedDivisionID))
          : 0;

        setActiveDivision({
          id: parsedUser.divisionIDs[index] ?? parsedUser.divisionIDs[0],
          name: parsedUser.divisionNames[index] ?? parsedUser.divisionNames[0],
        });
      }
    }

    setLoading(false);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        activeDivision,
        setActiveDivision,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export default UserContext;
