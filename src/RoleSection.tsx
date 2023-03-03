import { useHookstate } from '@hookstate/core';
import dayjs from 'dayjs';
import { ClipLoader } from 'react-spinners';
import {
  generateRangeOfDays,
  leftDateGlobal,
  Shift,
  shiftStateGlobal,
  User,
  UserShift,
  userShiftStateGlobal,
  userStateGlobal
} from './App';

export interface RoleSectionProps {
  title: string;
  role: string;
  dataFetching?: boolean;
  calendarWidth: number;
  maxCellSize: number;
}

const RoleSection = ({title, role, dataFetching = true, calendarWidth, maxCellSize}: RoleSectionProps) => {
  const userState = useHookstate<User[]>(userStateGlobal);
  const userShiftState = useHookstate<UserShift[]>(userShiftStateGlobal);
  const shiftState = useHookstate<Shift[]>(shiftStateGlobal);
  const leftDate = useHookstate<dayjs.Dayjs>(leftDateGlobal);

  /**
   * Gets the shift object (name/color) for given user on given day
   * @param userId
   * @param date
   * @returns
   */
  const getShiftValueForCell = (userId: string, date: dayjs.Dayjs): Shift | undefined => {
    const userShift = userShiftState
      .get({noproxy: true})
      .find(
        (obj) =>
          obj.user_id === userId &&
          dayjs(obj.shift_day).month() === date.month() &&
          dayjs(obj.shift_day).date() === date.date()
      );
    if (!userShift) {
      return {
        color: 'transparent',
        name: '',
      };
    } else {
      return shiftState.value.find((s) => s.name === userShift.shift_id);
    }
  };

  /**
   * Updates a person's shift for a given day
   * @param userId
   * @param date
   * @param shiftName
   */
  const updateShiftValueForCell = (userId: string, date: dayjs.Dayjs, shiftName: string,) => {
    const index = userShiftState.value.findIndex(
      (i) =>
        i.user_id === userId && dayjs(i.shift_day).month() === date.month() && dayjs(i.shift_day).date() === date.date()
    );
    if (index !== -1) {
      const existingShiftState = userShiftState[index].get({
        noproxy: true,
      }) as UserShift;
      existingShiftState.shift_id = shiftName;
      fetch('/user_shift', {
        method: 'post',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(existingShiftState),
      }).then(() => userShiftState[index].merge(existingShiftState));
    } else {
      const newShiftState = {
        shift_day: date.toISOString(),
        shift_id: shiftName,
        user_id: userId,
      };

      fetch('/user_shift', {
        method: 'post',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(newShiftState),
      }).then(() => userShiftState.set([...userShiftState.get({noproxy: true}), newShiftState]));
    }
  };

  return (
    <div className={'mb3'}>
      <h2>{title}</h2>
      {dataFetching ? (
        <div className={'w-100 justify-center flex flex-row mv3'}>
          <ClipLoader size={'60'} color={'rgb(77, 172, 255)'} />
        </div>
      ) : (
        <div className={'w-100 flex flex-row'}>
          <div className={'flex flex-column w-10'}>            
            {userState.value
              .filter((user) => user.role === role)
              .map((user) => (
                <div
                  key={user.email}
                  className={'w-100 rux-card rux-card__content flex items-center b--solid bw1 bt-0 bl-0 br-0 bb-1'}
                  style={{borderColor: 'var(--primary)', height: 50}}
                >
                  {user.last_name}
                </div>
              ))}
          </div>

          {/* Container for all calendar days */}
          <div id={`calendar-days-${role}`} className={'w-90 flex flex-column '}>            
            {/* User/Shift row */}
            {userState.value
              .filter((user) => user.role === role)
              .map((user) => (
                <div key={`${user.email}_shift_cell`} className={'w-100 flex flex-row '}>
                  {/* User/Shift cell */}
                  {generateRangeOfDays(leftDate.get(), calendarWidth / maxCellSize).map((day: dayjs.Dayjs, i) => (
                    <div
                      className={'flex w-10 justify-center b--solid bw1 bt-0 bl-0 br-0 bb-1'}
                      key={`${user.email}_${day.date()}_${day.month()}_${i}`}
                      id={`${user.email}_${day.date()}_${day.month()}_${i}`}
                      style={{
                        borderColor: 'var(--primary)',
                        maxWidth: maxCellSize,
                        height: 50,
                      }}
                    >
                      {
                        <select
                          id={'select_' + user.last_name + '_' + day.date() + '_' + day.month()}
                          className={'w-100 h-100 rux-card__content '}
                          style={{
                            backgroundColor: getShiftValueForCell(user.email, day)?.color ?? 'transparent',
                          }}
                          value={getShiftValueForCell(user.email, day)?.name ?? ''}
                          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                            updateShiftValueForCell(user.email, day, event.currentTarget.value);
                          }}
                        >
                          {shiftState.value.map((shift) => (
                            <option
                              id={`${shift.name}_${shift.color}`}
                              key={`${shift.name}_${shift.color}`}
                              value={shift.name}
                            >
                              {shift.name}
                            </option>
                          ))}
                        </select>
                      }
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSection;
