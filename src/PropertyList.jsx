import React              from 'react';
import PropTypes          from 'prop-types';
import { List, ListItem } from 'material-ui/List';

class PropertyList extends React.Component {
  static get propTypes() {
    return {
      schema: PropTypes.object.isRequired,
      item:   PropTypes.object.isRequired,
    }
  }
  render() {
    const { schema, item } = this.props;
    let entries = Object.entries(schema.properties);
    const listItems = entries.map(([name, info]) => {
      const value = item[name];
      return (
        <ListItem primaryText={name} secondaryText={value} />
      );
    });
    return (
      <List>
        {listItems}
      </List>
    );
  }
}

export default PropertyList;
