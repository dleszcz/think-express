import React, { PureComponent } from 'react';

export default class Countries extends PureComponent {
  render() {
    const countries = this.props.items;

    if (!countries) {
      return null;
    }

    return (
      <div className="countries">
        {
          countries.map((country, index) => (<div key={index}>{ country }</div>))
        }
      </div>
    )
  }
}