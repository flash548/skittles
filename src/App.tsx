import { hookstate } from '@hookstate/core';
import dayjs, { Dayjs } from 'dayjs';
import './App.css';
import { CalendarHeader } from './CalendarHeader';

export interface User {
  email: string;
  last_name: string;
  first_name: string;
  role: string;
}

export interface Shift {
  name: string;
  color: string;
}

export const generateRangeOfDays = (startDate: dayjs.Dayjs, count: number) => {
  const now = startDate;
  const retVal = [now];
  for (let i = 1; i < count; i++) {
    retVal.push(now.add(i, 'day'));
  }
  return retVal;
};

export interface UserShift {
  id?: number;
  shift_day: string;
  shift_id: string;
  user_id: string;
}

export const leftDateGlobal = hookstate<Dayjs>(dayjs());
export const userStateGlobal = hookstate<User[]>([]);
export const userShiftStateGlobal = hookstate<UserShift[]>([]);
export const shiftStateGlobal = hookstate<Shift[]>([]);

function App() {
  return (
    <>
      <div className={'w-100'}>
        <div
          className='flex ph2 w-100 justify-between items-center mb4'
          style={{backgroundColor: 'var(--tableHeaderBackgroundColor)'}}
        >
          <h1>SkittleChart</h1>

          <div>
            <a className='mr2' href='/logout'>
              Logout
            </a>
          </div>
        </div>
      </div>
      <CalendarHeader />
    </>
  );
}

export default App;
