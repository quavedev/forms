import React, { useState } from 'react';
import { Form } from './Form';

const defaultStyles = {
  buttonsCell: {
    padding: '8px',
  },
  table: {
    borderCollapse: 'collapse',
  },
  tr: {
    cursor: 'pointer',
    '& tr': {
      backgroundColor: '#ddd',
    },
  },
  th: { padding: '8px', border: '1px solid #ddd', margin: '0px' },
  td: { padding: '8px', border: '1px solid #ddd', margin: '0px' },
};

export const Table = ({
  definition,
  values = [],
  columns,
  format = () => {},
  onSubmit,
  formProps = {},
  cancelButtonLabel = 'CANCEL',
}) => {
  const [editingObject, setEditingObject] = useState(null);
  const columnNames = columns || Object.keys(values[0] || {});

  const handleRowClick = data => {
    setEditingObject(
      editingObject && editingObject === editingObject ? null : data
    );
  };

  const closeForm = () => setEditingObject(null);

  // Inject Cancel button
  const newFormProps = {
    ...formProps,
    actionButtons: [
      ...(formProps.actionButtons || []).map(actionButton => ({
        ...actionButton,
        handler: values => {
          closeForm();
          actionButton.handler(values);
        },
      })),
      {
        label: cancelButtonLabel,
        handler: closeForm,
      },
    ],
  };

  return (
    <>
      <table style={defaultStyles.table}>
        <thead>
          <tr>
            {columnNames.map((name, index) => (
              <th
                key={`table-header-${name}-${index}`}
                style={defaultStyles.th}
              >
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {values.map((data, index) => (
            <tr
              key={`table-row-${index}`}
              onClick={() => handleRowClick(data)}
              style={defaultStyles.tr}
            >
              {columnNames.map(key => {
                const formattedValue = format(key, data[key]) || data[key];
                return (
                  <td
                    key={`table-cell-${formattedValue}-${index}`}
                    style={defaultStyles.td}
                  >{`${formattedValue}`}</td>
                );
              })}
            </tr>
          ))}
          <tr>
            <td style={defaultStyles.buttonsCell}>
              <button onClick={() => setEditingObject({})}>NEW</button>
            </td>
          </tr>
        </tbody>
      </table>
      {editingObject && (
        <div
          onClick={closeForm}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            position: 'fixed',
            top: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0, 0.7)',
          }}
        >
          <Form
            initialValues={editingObject}
            definition={definition}
            onSubmit={values => {
              onSubmit(values);
              closeForm();
            }}
            style={{ backgroundColor: '#fff', padding: '16px' }}
            onClick={event => event.stopPropagation()}
            {...newFormProps}
          />
        </div>
      )}
    </>
  );
};
