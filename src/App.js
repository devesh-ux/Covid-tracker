import React,{useState, useEffect} from 'react';
import "./App.css"; 
import {MenuItem, FormControl,Select,Card,CardContent} from "@material-ui/core";
import Map from './Map';
import InfoBox from './InfoBox';
import Table from './Table';
import {sortData,prettyPrintStat} from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";

//USEEFFECT = runs a piece of code based on a given condition
function App() {
  //these are states
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setcountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter , setMapCenter] = 
  useState({ lat : 34.80746, lng : -40.4796});
  const [mapZoom, setMapZoom] =  useState(3);
  const [mapCountries,setMapCountries]= useState([]);
  const [casesType, setCasesType] = useState("cases");


  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response => response.json())
    .then(data =>{
      setcountryInfo(data);
    })
  },[])

  useEffect(() => {
    const getCountriesData = async () =>{
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => ({
          name:country.country,//united states
          value:country.countryInfo.iso2,//USA
        }));


        const sortedData = sortData(data);
        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries);
      });
    };
    

                                           //the code inside here will run once 
                                                //when the compenent loads and not again 
                                                // it loads whwnever app.jss run and countries run
//this is async call inside of a user file     

     getCountriesData();
  },[]);

  const onCountryChange = async (event) =>{
    const countryCode  = event.target.value;
    //setCountry(countryCode);

    const url = countryCode === 'worldwide'
    ? "https://disease.sh/v3/covid-19/all"
    : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then((response) => response.json())
    .then(data => {
        setCountry(countryCode);
       //all of the data..
       //from the country response   
       setcountryInfo(data);

       setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
       setMapZoom(4); 
    })

  };

  
console.log("contryInfo>>>>" , countryInfo)
  return (
    <div className="app">
      <div className="app__left">
          <div className="app__header">
            <h1>Covid-19 Tracker</h1>
            <FormControl className="app__dropdown">
              <Select 
              variant = "outlined" 
              onChange={onCountryChange} 
              value ={country}
              >
                <MenuItem value="worldwide">Worldwide</MenuItem>
                {countries.map((country) =>(
                    <MenuItem value= {country.value}>{country.name}</MenuItem>
                  ))}
              </Select>
            </FormControl>
          </div>
          <div className="app__stats">

            <InfoBox 
            isRed 
            active={casesType === "cases"}  
            onClick={(e) => setCasesType("cases")} 
            title="Coronavirus cases" 
            cases={prettyPrintStat(countryInfo.todayCases)} 
            total={countryInfo.cases} />

            <InfoBox  
            active={casesType === "recovered"}  
            onClick={(e) => setCasesType("recovered")} 
            title="Recovered" 
            cases={prettyPrintStat(countryInfo.todayRecovered)} 
            total={countryInfo.recovered} />

            <InfoBox 
            isRed 
            active={casesType === "deaths"}  
            onClick={(e) => setCasesType("deaths")} 
            title="Deaths" 
            cases={prettyPrintStat(countryInfo.todayDeaths)} 
            total={countryInfo.deaths}/>
          </div>
          <Map
           casesType={casesType}
           countries={mapCountries}
           center={mapCenter}
           zoom={mapZoom}
          />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live cases by country</h3>
          <Table countries={tableData}/>
          <h3>Worldwide new {casesType}</h3>
          <LineGraph casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
