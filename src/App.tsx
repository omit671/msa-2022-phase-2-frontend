import { useState } from 'react';
import './App.css';
import axios from "axios";
import {xml2json} from "xml-js";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";

const BGG_API_BASE_URL = "https://boardgamegeek.com/xmlapi2/";

function App() {
  const [searchQuery, setSearchQuery] = useState("");

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
            onChange={async event => setSearchQuery(event.target.value)}
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
            <p>No such board game with name: { searchQuery }</p>
        )}
      </div>
  );

  async function queryAPI() {
    let boardGameID;

    try
    {
      const searchResponse = await axios.get(`${BGG_API_BASE_URL}search?query=${searchQuery.replace(" ", "+")}`);

      const data = parseXML(searchResponse.data);

      console.log(data);

      boardGameID = data.items.item[0]._attributes.id;
    }
    catch (error)
    {
      setBoardGameInfo(undefined);

      throw error;
    }

    {
      // Note: order of the parameters is important
      const infoResponse = await axios.get(`${BGG_API_BASE_URL}thing?id=${boardGameID}`);

      const data = JSON.parse(xml2json(infoResponse.data, {compact: true})).items.item;

      console.log(data);

      setBoardGameInfo(data);
    }
  }
}

function parseXML(xml: string): any {
  return JSON.parse(xml2json(xml, {compact: true}));
}

export default App;
