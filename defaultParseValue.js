import { DateTimeType } from 'meteor/quave:custom-type-date-time/DateTimeType';
import { DateTime } from 'meteor/quave:custom-type-date-time';

export const defaultParseValue = ({ value, definition }) => {
  switch (definition?.type) {
    case DateTimeType:
      return DateTime.parseDate(value);

    default:
      return value;
  }
};
