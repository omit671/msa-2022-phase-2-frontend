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

  // Store the previous search query so error messages don't change when editing the search box
  const [previousSearchQuery, setPreviousSearchQuery] = useState("");

  const [boardGameInfo, setBoardGameInfo] = useState<undefined | null | any>(undefined);

  let renderedBoardGameInfo;

  if (boardGameInfo !== undefined)
  {
    if (boardGameInfo !== null)
    {
      let gameName;

      if (boardGameInfo.name instanceof Array)
      {
        gameName = (boardGameInfo.name as Array<any>).find(name => name._attributes.type === "primary")._attributes.value;
      }
      else
      {
        gameName = boardGameInfo.name._attributes.value;
      }

      renderedBoardGameInfo = <div>
        <img src={boardGameInfo.image._text!} alt={ `${gameName} Box Art`} width="30%" />

        <h2>{ gameName }</h2>

        <p>{ boardGameInfo.description._text }</p>
      </div>;
    }
    else
    {
      renderedBoardGameInfo = <p>No such board game with name: { previousSearchQuery }</p>;
    }
  }
  else
  {
    renderedBoardGameInfo = undefined;
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

        { renderedBoardGameInfo }
      </div>
  );

  async function queryAPI() {
    setPreviousSearchQuery(searchQuery);

    if (searchQuery.length === 0)
    {
      setBoardGameInfo(undefined);
      return;
    }

    let boardGameID;

    {
      const searchResponse = await axios.get(`${BGG_API_BASE_URL}search?query=${searchQuery.replace(" ", "+")}`);

      const data = parseXML(searchResponse.data).items.item;

      console.log(data);

      if (data !== undefined)
      {
        boardGameID = data[0]._attributes.id;
      }
      else
      {
        setBoardGameInfo(null);
        return;
      }
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
