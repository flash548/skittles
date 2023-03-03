import { useHookstate } from "@hookstate/core";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { User, userStateGlobal, UserShift, userShiftStateGlobal, Shift, shiftStateGlobal, leftDateGlobal, generateRangeOfDays } from "./App";
import { useWindowSize } from "./hooks/useWindowResize";
import RoleSection from "./RoleSection";

export const CalendarHeader = () => {
  const userState = useHookstate<User[]>(userStateGlobal);
  const userShiftState = useHookstate<UserShift[]>(userShiftStateGlobal);
  const shiftState = useHookstate<Shift[]>(shiftStateGlobal);
  const leftDate = useHookstate<dayjs.Dayjs>(leftDateGlobal);
  const [dataFetching, setDataFetching] = useState(true);
  const windowSize = useWindowSize();

  useEffect(() => {
    fetchData();
  }, [windowSize.width]);

  const fetchData = async () => {
    setDataFetching(true);
    fetch('/shifts')
      .then((resp) => resp.json())
      .then((shifts: Shift[]) => shiftState.set([...shifts, {name: '', color: 'transparent'}]))
      .then(() =>
        fetch('/users')
          .then((resp) => resp.json())
          .then((users: User[]) => {
            userState.set(users);
          })
      )
      .then(() =>
        fetch('/user_shifts')
          .then((resp) => resp.json())
          .then((userShifts: UserShift[]) => {
            userShiftState.set(userShifts);
          })
      )
      .finally(() => setDataFetching(false));
  };

  // nominal / max width for a shift cell
  const cellWidth = 150;

  /**
   * determines width of the calendar area
   * @returns width in pixels
   */
  const getCalendarWidth = () => {
    const calendar = document.getElementById(`calendar-days-header`);
    const width = calendar?.getBoundingClientRect().width;
    return width ?? 600;
  };


  /**
   * Bumps the calendar to the right by one day
   */
  const bumpCalFwd = () => {
    leftDate.set(leftDate.get().add(1, 'd'));
  };

  /**
   * Bumps the calendar to the left by one day
   */
  const bumpCalBack = () => {
    leftDate.set(leftDate.get().add(-1, 'd'));
  };

  const calWidth = getCalendarWidth();

  return (
    <div className={'mb3'}>
      <div className={'w-100 flex flex-row'}>
        <div className={'flex flex-column w-10'}>
          <div
            className={'flex w-100 rux-card__content rux-card '}
            style={{backgroundColor: 'var(--tableHeaderBackgroundColor)'}}
          >
            Name
          </div>
        </div>

        {/* Container for all calendar days */}
        <div id={`calendar-days-header`} className={'w-90 flex flex-column '}>
          {/* Day/Date titles */}
          {
            <div className={'w-100 flex flex-row '}>
              {generateRangeOfDays(leftDate.get(), getCalendarWidth() / cellWidth).map(
                (day: dayjs.Dayjs, index, arr) => (
                  <div
                    key={'day_title_' + day.format('DD-MMM')}
                    className={'flex w-10 rux-card__content justify-center'}
                    style={{
                      backgroundColor: 'var(--tableHeaderBackgroundColor)',
                      maxWidth: cellWidth,
                      position: 'relative',
                    }}
                  >
                    {index === 0 && (
                      <button
                        id='cal-back'
                        onClick={bumpCalBack}
                        className={'rux-button ma0 pa0 h-auto'}
                        style={{position: 'absolute', left: 0}}
                      >
                        {'<'}
                      </button>
                    )}
                    {day.format('DD-MMM')}
                    {index === arr.length - 1 && (
                      <button
                        id='cal-fwd'
                        onClick={bumpCalFwd}
                        className={'rux-button ma0 pa0 h-auto'}
                        style={{position: 'absolute', right: 0}}
                      >
                        {'>'}
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          }
        </div>
      </div>
      <RoleSection dataFetching={dataFetching} calendarWidth={calWidth} maxCellSize={cellWidth} role='PC' title='PCs' />
      <RoleSection dataFetching={dataFetching} calendarWidth={calWidth} maxCellSize={cellWidth} role='PI' title='PIs' />
      <RoleSection dataFetching={dataFetching} calendarWidth={calWidth} maxCellSize={cellWidth} role='CE' title='CEs'/>
      <RoleSection dataFetching={dataFetching} calendarWidth={calWidth} maxCellSize={cellWidth} role='MO' title='MOs' />
      <RoleSection dataFetching={dataFetching} calendarWidth={calWidth} maxCellSize={cellWidth} role='OPS' title='OPs' />
    </div>
  );
};
