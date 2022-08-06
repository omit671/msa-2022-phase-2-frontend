import { useState } from 'react';
import './App.css';
import axios from "axios";
import {xml2json} from "xml-js";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";

const BGG_THING_API_URL = "https://boardgamegeek.com/xmlapi2/thing";

function App() {
  const [boardGameID, setBoardGameID] = useState("");

  const [boardGameInfo, setBoardGameInfo] = useState<undefined | any>(undefined);

  let gameName;

  if (boardGameInfo !== undefined)
  {
    if (boardGameInfo.name instanceof Array)
    {
      gameName = (boardGameInfo.name as Array<any>).find(name => name._attributes.type === "primary")._attributes.value;
    }
    else
    {
      gameName = boardGameInfo.name._attributes.value;
    }
  }
  else
  {
    gameName = undefined;
  }

  return (
      <div>
        <h1>Board Game Search</h1>

        <div>
          <TextField
            id="search-bar"
            className="text"
            label="Board game name"
            onChange={async event => setBoardGameID(event.target.value)}
            style={{ width: 1000 }}
          />
          <IconButton
            onClick={queryAPI}
            aria-label="search"
          />
          <SearchIcon style={{ fill: "green" }} />
        </div>

        { boardGameInfo !== undefined ? (
            <div>
              <img src={boardGameInfo.image._text!} alt={ `${gameName} Box Art`} width="30%" />

              <h2>{ gameName }</h2>

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
