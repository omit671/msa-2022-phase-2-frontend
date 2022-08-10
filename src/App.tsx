import { useState } from 'react';
import './App.css';
import axios from "axios";
import {xml2json} from "xml-js";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import {FormControlLabel, Switch} from "@mui/material";
import {decode} from "html-entities";

const BGG_API_BASE_URL = "https://boardgamegeek.com/xmlapi2/";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [useStricterNameMatching, setUseStricterNameMatching] = useState(false);

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
        <hr />

        <img src={boardGameInfo.image._text!} alt={ `${gameName} Box Art`} id="game-box-art" />

        <h2>{ gameName }</h2>

        <p id="game-description">{ decode(boardGameInfo.description._text) }</p>
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
          <div id="search-bar">
            <TextField
              id="search-text-box"
              className="text"
              label="Board game name"
              fullWidth
              onChange={async event => setSearchQuery(event.target.value)}
            />
            <IconButton
              onClick={queryAPI}
              aria-label="search"
              size="large"
            >
              <SearchIcon style={{ fill: "blue" }} id="search-icon" fontSize="inherit" />
            </IconButton>
          </div>
          <br />
          <FormControlLabel control={<Switch onChange={event => setUseStricterNameMatching(event.target.checked)} />} label="Use stricter name matching" />
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

    // First we retrieve the game ID based on a search string
    let boardGameID;

    {
      const searchResponse = await axios.get(`${BGG_API_BASE_URL}search?query=${searchQuery.replace(" ", "+")}&type=boardgame,boardgameexpansion,exact=${useStricterNameMatching ? 1 : 0}`);

      const data = parseXML(searchResponse.data).items.item;

      if (data !== undefined)
      {
        if (useStricterNameMatching)
        {
          boardGameID = data.find((game: any) => game.name._attributes.value.toLowerCase() === searchQuery.toLowerCase())._attributes.id;
        }
        else
        {
          boardGameID = data[0]._attributes.id;
        }
      }
      else
      {
        setBoardGameInfo(null);
        return;
      }
    }

    // Then we actually retrieve the game's data using its ID
    {
      // Note: order of the parameters is important
      const infoResponse = await axios.get(`${BGG_API_BASE_URL}thing?id=${boardGameID}&type=boardgame,boardgameexpansion`);

      const data = JSON.parse(xml2json(infoResponse.data, {compact: true})).items.item;

      setBoardGameInfo(data);
    }
  }
}

function parseXML(xml: string): any {
  return JSON.parse(xml2json(xml, {compact: true}));
}

export default App;
