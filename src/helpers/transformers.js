//groupBy expects SORTED values!!!
export const groupBy = (data, columnName, functor = null) => {
  const keys = [];
  const groups = {};
  const getKey = functor || ((value) => value);

  data.forEach(item => {
    const newKey = getKey(item[columnName]);
    const newItem = {...item, [columnName + "New"]: newKey}

    if (newKey in groups) {
      groups[newKey].push(newItem);
    } else {
      keys.push(newKey);
      groups[newKey] = [newItem];
    }
  });

  return { keys, groups };
};

export const getDate = (date, options = {}) => { return (new Date(date)).toLocaleDateString("en-GB", options)}