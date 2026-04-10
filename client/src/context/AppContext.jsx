import { createContext, useState } from "react";

export const AppContext = createContext();

export function AppProvider({children}) {
    const [participant, setParticipant] = useState(null);
    const [friend, setFriend] = useState(null);

    return (
        <AppContext.Provider
            value={{
                participant,
                setParticipant,
                friend,
                setFriend
            }}
        >
            {children}
        </AppContext.Provider>
    );
}