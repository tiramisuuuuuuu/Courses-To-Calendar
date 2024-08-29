'use server';

import { getServerSession } from "next-auth/next";
import { authConfig } from "../api/auth/[...nextauth]/route";
import { google } from "googleapis";


export async function add_to_calendar(courseObj: object) {
  const session = await getServerSession(authConfig);
  if (!session) {
    console.log("erm what");
    return;
  }
  console.log("Session successful");

  const auth = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
  auth.setCredentials({
    access_token: session?.accessToken,
    refresh_token: session?.refreshToken,
    });
  console.log("Connection successful");

  const calendar = google.calendar({ auth, version: "v3" });
  let calendar_id = "";
  let calendarList_obj = await calendar.calendarList.list()
  let calendar_items = calendarList_obj.data.items;
  for (let i=0; i<calendar_items.length; i++) {
    const cal_obj = calendar_items[i];
    if (cal_obj?.summary == "Courses-To-Cal") {
      console.log("found calendar");
      calendar_id = cal_obj?.id;
      }
    }
  if (calendar_id == "") {
    // Insert the new calendar
    console.log("creating calendar");
    let createdCalendar = await calendar.calendars.insert({
      requestBody: {
        summary: 'Courses-To-Cal',
        timeZone: 'America/Los_Angeles',
        },
      });
    calendar_id = createdCalendar.data.id;
  }
  
  extract_eventDetails(courseObj);
  for (let i=0; i<courseObj.eventDetails.length; i++) {
    let event = courseObj.eventDetails[i]
    calendar.events.insert({
      'calendarId': calendar_id,
      'resource': {
        'summary': courseObj.course.concat(" ", courseObj.title),
        'description': courseObj.location[i],
        'start': {
          'dateTime': event[0],
          'timeZone': 'America/Los_Angeles',
        },
        'end': {
          'dateTime': event[1],
          'timeZone': 'America/Los_Angeles',
        },
        'recurrence': [
          ('RRULE:FREQ=WEEKLY;UNTIL=').concat(event[2], ";BYDAY=", event[3])
        ],
        }
      });
    }
  return;

}


const first_week = [ // first weekdays returning to school in order M-F
  ["M", "2024-09-30"],
  ["T", "2024-10-01"],
  ["W", "2024-09-25"],
  ["R", "2024-09-26"],
  ["F", "2024-09-27"],
];
const last_week = [ // last weekdays of the quarter in order
  ["M", "2024-12-02"],
  ["T", "2024-12-03"],
  ["W", "2024-12-04"],
  ["R", "2024-12-05"],
  ["F", "2024-12-06"],
];
const instruction_start = 2;
const instruction_end = 4;


function extract_eventDetails(courseObj: object) {
  console.log(courseObj);
  let eventDetails = [];

  let timing_array = courseObj.timing;
  for (let i=0; i<timing_array.length; i++) {
    let timing = timing_array[i];
    let start_time, finish_time, select_AmPm, days;
    [start_time, timing] = timing.split(" - ");
    [finish_time, select_AmPm, days] = timing.split(" ");

    let convert_24hrFormat = (time, select_AmPm) => {
      let [hours, minutes] = time.split(":");
      if (select_AmPm == "PM,") {
        if (hours != "12") {
          hours = (parseInt(hours)+12).toString();
          }
        }
      else if (hours == "12") {
        hours = "00";
        }
      return (hours.concat(":", minutes)).padStart(5, "0");
      }
    
    start_time = convert_24hrFormat(start_time, select_AmPm);
    finish_time = convert_24hrFormat(finish_time, select_AmPm);
    days = days.trim();
    console.log(start_time);
    console.log(finish_time);
    
    let [start_day_index, end_day_index] = [-1, -1];
    let bydays = "";
    let get_relativeIndex = (index, start_index) => {
      let relative_index = index - start_index; // start_index becomes 0 point 
      if (relative_index < 0) {
        relative_index = (4-start_index) + index; 
      }
      return relative_index;
    }
    for (let j=0; j<days.length; j++) {
      let day = days[j];
      console.log(day);
      let z;
      if (day == "M") { bydays = bydays.concat("MO,"); z=0 }
      else if (day == "T") { bydays = bydays.concat("TU,"); z=1 }
      else if (day == "W") { bydays = bydays.concat("WE,"); z=2 }
      else if (day == "R") { bydays = bydays.concat("TH,"); z=3 }
      else { bydays = bydays.concat("FR"), z=4 }
      
      if (start_day_index == -1) {
        start_day_index = z;
        end_day_index = z;
        continue;
        }

      if (get_relativeIndex(z, instruction_start) < get_relativeIndex(start_day_index, instruction_start)) {
        start_day_index = z
        }

      if (end_day_index != instruction_end) {
        if (instruction_end == z) { end_day_index = z }
        else if (get_relativeIndex(z, instruction_end) > get_relativeIndex(end_day_index, instruction_end)) {
          end_day_index = z
          }
        }
      }
    let event = [];
    event.push(first_week[start_day_index][1].concat("T", start_time, ":00-07:00")); //start
    event.push(first_week[start_day_index][1].concat("T", finish_time, ":00-07:00")); //end
    event.push((last_week[end_day_index][1].split("-").join("")).concat("T235900Z")) //until
    event.push(bydays); //bydays
    eventDetails.push(event);
  }
  courseObj.eventDetails = eventDetails;
  return;
}