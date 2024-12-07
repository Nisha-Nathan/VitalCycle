import moment from "moment";
import { date } from "zod";
/**
 * Encode a date as an unambiguous string
 *
 * @param {Date} date - A date object
 * @returns {string} - formatted date as string
 */
export const formatDate = (date: Date): string => moment(date).format("MMMM Do YYYY, h:mm a");

export const formatDateToday = (date: Date): string => {
    console.log("date", date);
    return moment(date).format("dddd, D MMMM")};
