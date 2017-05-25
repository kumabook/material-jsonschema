import React           from 'react';
import PropTypes       from 'prop-types';
import TextField       from 'material-ui/TextField';
import RaisedButton    from 'material-ui/RaisedButton';
import DatePicker      from 'material-ui/DatePicker';
import TimePicker      from 'material-ui/TimePicker';
import ReactS3Uploader from 'react-s3-uploader';
import { getFileUrl }  from './url';
import dateUtil        from './date';

const dateFieldWidth = 96;
const dateFieldStyle = {
  width:    dateFieldWidth,
  overflow: 'hidden',
  display:  'inline-block',
};

const fieldType = (schema, formSchema) => {
  if (formSchema && formSchema['ui:widget']) {
    return formSchema['ui:widget'];
  }
  if (schema.type === 'integer' || schema.type === 'float') {
    return 'number';
  }
  if (schema.type === 'string') {
    if (schema.format === 'data-url') {
      return 'data-url';
    } else if (schema.format === 'date') {
      return 'date';
    } else if (schema.format === 'date-time') {
      return 'date-time';
    }
  }
  return schema.type;
};

class Form extends React.Component {
  static get propTypes() {
    return {
      schema:            PropTypes.object.isRequired,
      formSchema:        PropTypes.object.isRequired,
      item:              PropTypes.object.isRequired,
      onSubmit:          PropTypes.func.isRequired,
      submitButtonLabel: PropTypes.string.isRequired,
    };
  }
  constructor(props) {
    super(props);
    this.state = { item: props.item };
  }
  handleValueChange(name, value) {
    const item = Object.assign({}, this.state.item, { [name]: value });
    this.setState({ item });
  }
  handleDateValueChange(name, value) {
    const date = dateUtil.parse(this.state.item[name]);
    date.setFullYear(value.getFullYear(),
                     value.getMonth(),
                     value.getDate());
    this.handleValueChange(name, date);
  }
  handleTimeValueChange(name, value) {
    const date = dateUtil.parse(this.state.item[name]);
    date.setHours(value.getHours(),
                  value.getMinutes(),
                  value.getSeconds(),
                  value.getMilliseconds());
    this.handleValueChange(name, date);
  }
  handleUploadFinish(name, { publicUrl }) {
    this.handleValueChange(name, getFileUrl(publicUrl));
  }
  render() {
    const properties = Object.entries(this.props.schema.properties)
                             .filter(([name]) => {
                               const v = this.props.formSchema[name];
                               return !v || v['ui:widget'] !== 'hidden';
                             });
    const fields = properties.map(([name, schema]) => {
      const formSchema = this.props.formSchema[name] || {};
      switch (fieldType(schema, formSchema)) {
        case 'number':
          return (
            <div key={name}>
              <TextField
                type="number"
                hintText={name}
                floatingLabelText={name}
                floatingLabelFixed
                onChange={(event, value) => this.handleValueChange(name, value)}
                value={this.state.item[name] || 0}
              />
            </div>
          );
        case 'string':
          return (
            <div key={name}>
              <TextField
                {...formSchema['ui:options']}
                hintText={name}
                floatingLabelText={name}
                floatingLabelFixed
                onChange={(event, value) => this.handleValueChange(name, value)}
                value={this.state.item[name] || ''}
              />
            </div>
          );
        case 'data-url':
          return (
            <div key={name}>
              <TextField
                hintText={name}
                floatingLabelText={name}
                floatingLabelFixed
                onChange={(event, value) => this.handleValueChange(name, value)}
                value={this.state.item[name] || ''}
              />
            </div>
          );
        case 'date':
          return (
            <DatePicker
              style={dateFieldStyle}
              floatingLabelText={name}
              floatingLabelFixed
              autoOk
              value={dateUtil.parse(this.state.item[name])}
            />
          );
        case 'date-time':
          return (
            <div key={name}>
              <DatePicker
                style={dateFieldStyle}
                value={dateUtil.parse(this.state.item[name])}
                floatingLabelText={name}
                floatingLabelFixed
                autoOk
                onChange={(e, value) => this.handleDateValueChange(name, value)}
              />
              <TimePicker
                style={dateFieldStyle}
                value={dateUtil.parse(this.state.item[name])}
                floatingLabelText=" "
                floatingLabelFixed
                autoOk
                onChange={(e, value) => this.handleTimeValueChange(name, value)}
              />
            </div>
          );
        case 's3-uploader':
          return (
            <div key={name}>
              <TextField
                hintText={name}
                floatingLabelText={name}
                floatingLabelFixed
                value={this.state.item[name] || ''}
                onChange={(event, value) => this.handleValueChange(name, value)}
              />
              <ReactS3Uploader
                style={{ display: 'inline', paddingLeft: 12 }}
                signingUrl="/s3/sign"
                signingUrlMethod="GET"
                accept="*"
                signingUrlWithCredentials
                uploadRequestHeaders={{ 'x-amz-acl': 'public-read' }}
                contentDisposition="auto"
                scrubFilename={filename => filename.replace(/[^\w\d_\-.]+/ig, '')}
                onFinish={result => this.handleUploadFinish(name, result)}
              />
            </div>
          );
        default:
          return <div key={name}>unknown type</div>;
      }
    });
    return (
      <div style={{ margin: '40px' }}>
        {fields}
        <br />
        <RaisedButton
          label={this.props.submitButtonLabel}
          primary
          onTouchTap={() => this.props.onSubmit(this.state.item)}
        />
      </div>
    );
  }
}

export default Form;
