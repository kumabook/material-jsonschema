import * as React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import Dialog               from 'material-ui/Dialog';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd           from 'material-ui/svg-icons/content/add';
import ContentCreate        from 'material-ui/svg-icons/content/create';
import ContentRemove        from 'material-ui/svg-icons/content/remove';
import FlatButton           from 'material-ui/FlatButton';
import Paginate             from './Paginate';
import Form                 from './Form';

const imageHeight = 44;

const widgetType = (schema, tableSchema) => {
  const type = schema.type;
  const widget = tableSchema && tableSchema['ui:widget'];
  if (type === 'string') {
    if (schema.format === 'data-url') {
      if (widget === 'img') {
        return 'image';
      }
      if (widget === 'audio') {
        return 'audio';
      }
      return 'link';
    }
  }
  return 'text';
};

export const DialogType = {
  Hidden:  'Hidden',
  Destroy: 'Destroy',
  New:     'New',
  Edit:    'Edit',
};

class ResourceTable extends React.Component {
  static get propTypes() {
    return {
      schema:       PropTypes.object.isRequired,
      tableSchema:  PropTypes.object.isRequired,
      formSchema:   PropTypes.object.isRequired,
      items:        PropTypes.array.isRequired,
      page:         PropTypes.number.isRequired,
      perPage:      PropTypes.number.isRequired,
      pageCount:    PropTypes.number.isRequired,
      onPageChange: PropTypes.func.isRequired,
      onCreate:     PropTypes.func.isRequired,
      onUpdate:     PropTypes.func.isRequired,
      onDestroy:    PropTypes.func.isRequired,
    };
  }
  constructor(props) {
    super(props);
    this.state = {
      dialogType: DialogType.Hidden,
      item:       {},
    };
    this.handleEditDialogSubmit = this.handleEditDialogSubmit.bind(this);
    this.handleDestroyDialogSubmit = this.handleDestroyDialogSubmit.bind(this);
    this.handleDialogClose = this.handleDialogClose.bind(this);
    this.handleDialogCancel = this.handleDialogCancel.bind(this);
  }
  handleNewButtonClick() {
    this.setState({ dialogType: DialogType.New, item: {} });
  }
  handleEditButtonClick(item) {
    this.setState({ dialogType: DialogType.Edit, item });
  }
  handleDestroyButtonClick(item) {
    this.setState({ dialogType: DialogType.Destroy, item });
  }
  handleCreateDialogSubmit(item) {
    this.props.onCreate(item);
    this.setState({ dialogType: DialogType.Hidden });
  }
  handleEditDialogSubmit(item) {
    this.props.onUpdate(item);
    this.setState({ dialogType: DialogType.Hidden });
  }
  handleDestroyDialogSubmit() {
    this.props.onDestroy(this.state.item);
    this.setState({ dialogType: DialogType.Hidden });
  }
  handleDialogClose() {
    this.setState({ dialogType: DialogType.Hidden, item: {} });
  }
  handleDialogCancel() {
    this.setState({ dialogType: DialogType.Hidden, item: {} });
  }
  renderNewDialog() {
    return (
      <Dialog
        title={`New ${this.props.schema.title}`}
        open
        autoScrollBodyContent
        onRequestClose={this.handleDialogClose}
      >
        <Form
          schema={this.props.schema}
          formSchema={this.props.formSchema}
          item={this.state.item}
          onSubmit={item => this.handleCreateDialogSubmit(item)}
          submitButtonLabel="Create"
        />
      </Dialog>
    );
  }
  renderEditDialog() {
    return (
      <Dialog
        title={`Edit ${this.props.schema.title}`}
        modal={false}
        open
        autoScrollBodyContent
        onRequestClose={this.handleDialogClose}
      >
        <Form
          schema={this.props.schema}
          formSchema={this.props.formSchema}
          item={this.state.item}
          onSubmit={this.handleEditDialogSubmit}
          submitButtonLabel="Update"
        />
      </Dialog>
    );
  }
  renderDestroyDialog() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary
        keyboardFocused
        onTouchTap={this.handleDialogClose}
      />,
      <FlatButton
        label="OK"
        onTouchTap={this.handleDestroyDialogSubmit}
      />,
    ];
    return (
      <Dialog
        title="Confirmation"
        actions={actions}
        modal={false}
        open
      >
        {`Are you sure you want to the ${this.props.schema.title}?`}
      </Dialog>
    );
  }
  renderDialog() {
    switch (this.state.dialogType) {
      case DialogType.Hidden:
        return <Dialog open={false} />;
      case DialogType.New:
        return this.renderNewDialog();
      case DialogType.Edit:
        return this.renderEditDialog();
      case DialogType.Destroy:
        return this.renderDestroyDialog();
      default:
        return null;
    }
  }
  renderHeaderRows(properties) {
    const headerColumns = properties.map(([name]) => ((
      <TableHeaderColumn key={name}>{name}</TableHeaderColumn>
    )));
    headerColumns.push(
      <TableHeaderColumn key="actions">
        actions
      </TableHeaderColumn>);
    const { perPage } = this.props;
    return [
      <TableRow key="paginate">
        <TableHeaderColumn colSpan={1} />
        <TableHeaderColumn
          colSpan={properties.length - 1}
          style={{ textAlign: 'center' }}
        >
          <Paginate
            page={this.props.page}
            pageCount={this.props.pageCount}
            onChange={({ selected }) => this.props.onPageChange(selected, perPage)
            }
          />
        </TableHeaderColumn>
        <TableHeaderColumn
          colSpan={1}
        >
          <FloatingActionButton
            mini
            onTouchTap={() => this.handleNewButtonClick()}
          >
            <ContentAdd />
          </FloatingActionButton>
        </TableHeaderColumn>
      </TableRow>,
      <TableRow key="props">
        {headerColumns}
      </TableRow>,
    ];
  }
  renderRows(properties) {
    const { items, tableSchema } = this.props;
    return items.map((item) => {
      const columns = properties.map(([name, info]) => {
        switch (widgetType(info, tableSchema[name])) {
          case 'link':
            return [name, <a href={item[name]}>{item[name]}</a>];
          case 'image':
            return [name, (
              <a href={item[name]}>
                <img src={item[name]} alt={item[name]} height={imageHeight} />
              </a>
            )];
          case 'audio':
            return [name, (
              <audio controls><track kind="captions" src={item[name]} /></audio>
            )];
          default:
            return [name, item[name]];
        }
      }).map(([name, child]) => <TableRowColumn key={name}>{child}</TableRowColumn>);
      columns.push((
        <TableRowColumn key="actions">
          <FloatingActionButton
            mini
            onTouchTap={() => this.handleEditButtonClick(item)}
          >
            <ContentCreate />
          </FloatingActionButton>
          &nbsp;
          <FloatingActionButton
            mini
            onTouchTap={() => this.handleDestroyButtonClick(item)}
          >
            <ContentRemove />
          </FloatingActionButton>
        </TableRowColumn>
      ));
      return (
        <TableRow key={item.id}>
          {columns}
        </TableRow>
      );
    });
  }
  render() {
    const { schema, tableSchema } = this.props;
    const properties = Object.entries(schema.properties)
                             .filter(([name]) => {
                               const v = tableSchema[name];
                               return !v || v['ui:widget'] !== 'hidden';
                             });
    return (
      <div>
        <Table selectable={false}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            {this.renderHeaderRows(properties)}
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {this.renderRows(properties)}
          </TableBody>
        </Table>
        {this.renderDialog()}
      </div>
    );
  }
}

export default ResourceTable;
