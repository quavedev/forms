import { DateTimeType } from 'meteor/quave:custom-type-date-time/DateTimeType';

export const defaultStringifyValue = ({ value, definition }) => {
  switch (definition?.type) {
    case DateTimeType:
      return value ? value.formatDate() : value;

    default:
      return value;
  }
};
