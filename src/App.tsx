import { useState } from 'react';
import './App.css';
import axios from "axios";

const BGG_THING_API_URL = "https://boardgamegeek.com/xmlapi2/thing";

function App() {
  const [boardGameID, setBoardGameID] = useState("");

  return (
      <div>
        <h1>Board Game Search</h1>

        <div>
          <label>Board Game ID</label>
          <br />
          <input
              type="text"
              id="board-game-id"
              name="board-game-name"
              onChange={async event => setBoardGameID(event.target.value)}
          />
          <br />
          <button onClick={queryAPI}>Search</button>
        </div>
      </div>
  );

  async function queryAPI() {
    const response = await axios.get(BGG_THING_API_URL + "?id=" + boardGameID);

    console.log(response.data);
  }
}

export default App;
