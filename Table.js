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

/**
 * Build a complete CRUD table just from the values and their definition.
 * @param definition
 * @param fields
 * @param values
 * @param format
 * @param columns
 * @param onSubmit
 * @param formProps
 * @param cancelButtonLabel
 * @param transformBeforeUse
 * @param transformAfterUse
 * @returns {JSX.Element}
 * @constructor
 */
export const Table = ({
  definition,
  fields: fieldsInput,
  objects: rawObjects = [],
  format = () => {},
  pickColumns,
  omitColumns,
  onSubmit,
  formProps: rawFormProps = {},
  cancelButtonLabel = 'CANCEL',
  transformBeforeUse,
  transformAfterUse,
  component: TableComponent,
}) => {
  const fields = definition?.fields || fieldsInput;
  const objects = transformBeforeUse
    ? rawObjects.map(object =>
        Object.fromEntries(
          Object.entries(object).map(([key, rawValue]) => {
            const value = transformBeforeUse(rawValue, fields[key], key);

            // Return value only if it's not null or undefined
            return [key, value ?? rawValue];
          })
        )
      )
    : { ...rawObjects };
  const [editingObject, setEditingObject] = useState(null);

  if (omitColumns) {
    omitColumns.forEach(columnName =>
      objects.map(object => delete object[columnName])
    );
  }

  const columnNames = pickColumns || Object.keys(objects[0] || {});

  const handleRowClick = data => {
    setEditingObject(
      editingObject && editingObject === editingObject ? null : data
    );
  };

  const closeForm = () => setEditingObject(null);

  // Inject Cancel button
  const formProps = {
    ...rawFormProps,
    actionButtons: [
      ...(rawFormProps.actionButtons || []).map(actionButton => ({
        ...actionButton,
        handler: ({ values }) => {
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

  if (TableComponent) {
    const rowData =
      TableComponent &&
      objects.map((object, index) =>
        columnNames.map(key => ({
          edit: () => setEditingObject(object),
          values: format(object[key], fields[key], key) || object[key],
        }))
      );

    return <TableComponent columnNames={columnNames} rowData={rowData} />;
  }

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
                {fields[name]?.label || name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {objects.map((object, index) => (
            <tr
              key={`table-row-${index}`}
              onClick={() => handleRowClick(object)}
              style={defaultStyles.tr}
            >
              {columnNames.map(key => {
                const formattedValue =
                  format(object[key], fields[key], key) || object[key];
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
            backdropFilter: 'blur(2px)',
          }}
        >
          <Form
            initialValues={editingObject}
            definition={definition}
            fields={fields}
            onSubmit={values => {
              const transformedValues = transformAfterUse
                ? values.map(value => {
                    const transformedValue = transformAfterUse(values);

                    return transformedValue ?? value;
                  })
                : values;
              onSubmit(transformedValues);
              closeForm();
            }}
            style={{ backgroundColor: '#fff', padding: '16px' }}
            onClick={event => event.stopPropagation()}
            {...formProps}
          />
        </div>
      )}
    </>
  );
};
