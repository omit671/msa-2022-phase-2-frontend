import { useState } from 'react';
import './App.css';
import axios from "axios";
import {xml2json} from "xml-js";

const BGG_THING_API_URL = "https://boardgamegeek.com/xmlapi2/thing";

function App() {
  const [boardGameID, setBoardGameID] = useState("");

  const [boardGameInfo, setBoardGameInfo] = useState<undefined | any>(undefined);

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

        { boardGameInfo !== undefined ? (
            <div>
              <img src={boardGameInfo.image._text!} alt={ `${boardGameInfo.name._attributes.value} Box Art`} />

              <h2>{ boardGameInfo.name._attributes.value }</h2>

              <p>{ boardGameInfo.description._text }</p>
            </div>
        ) : (
            <p>No such board game with id { boardGameID }</p>
        )}
      </div>
  );

  async function queryAPI() {
    try
    {
      const response = await axios.get(BGG_THING_API_URL + "?id=" + boardGameID);

      const data = JSON.parse(xml2json(response.data, {compact: true}));

      const itemData = data.items.item;

      console.log(itemData);

      setBoardGameInfo(itemData);
    }
    catch (error)
    {
      setBoardGameInfo(undefined);

      throw error;
    }
  }
}

export default App;
