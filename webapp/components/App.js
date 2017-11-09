import React, { PureComponent } from 'react';
import axios from 'axios';
import Countries from './Countries';
import io from 'socket.io-client';

export default class App extends PureComponent {
  constructor() {
    super();

    this.state = {
      countries: [],
      inputValue: ''
    }
  }

  componentWillMount() {
    this.getCountries();
    this.listenSocket();
  }

  getCountries() {
    axios.get('http://10.100.1.42:8888/countries').then((response) => {
      let countries = [];
      response.data.map((country) => {
        countries.push(country.name);
      });

      this.setState({
        countries: [...countries]
      });
    })
  }

  listenSocket() {
    const socket = io('http://10.100.1.42:4444');
    socket.on('countries_updated', (item) => {
      this.setState({
        countries: this.state.countries.concat(item.new_val.name)
      })
    })
  }

  addCountry() {
    axios.post(`http://10.100.1.42:8888/countries/create?name=${this.state.inputValue}`)
      .then((response) => {
        this.setState({
          inputValue: ''
        })
      });
  }

  updateInputValue(evt) {
    this.setState({
      inputValue: evt.target.value
    })
  }

  render() {
    const countries = this.state.countries;

    return (
      <div>
        <h1 style={{textAlign: 'center'}}>React app</h1>

        <Countries items={countries} />

        <button onClick={() => this.addCountry()} onSubmit={() => this.addCountry()}>Add new Country</button>
        <input type="text" value={this.state.inputValue} onChange={(e) => this.updateInputValue(e)}/>

      </div>);
  }
}