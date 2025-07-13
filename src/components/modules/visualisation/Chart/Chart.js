import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { PureComponent, useState } from "react";
import { Bar, BarChart, Brush, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import './Chart.css';

export default function Chart({ observations, typeColors }) {
    const [valueKey, setValueKey] = useState("");
    const [operatorKey, setOperatorKey] = useState("Add");

    const getCustomDataFields = () => {
        const customDataFields = new Set();
        observations.forEach((observation) => {
            observation.geoObjects.forEach((geoObject) => {
                if (geoObject.customAttributes) {
                    Object.keys(geoObject.customAttributes).forEach((key) => {
                        customDataFields.add(key);
                    });
                }
            });
        });
        return Array.from(customDataFields);
    }

    const handleFieldSelected = (event) => { 
        setValueKey(event.target.value);
    }

    const handleOperatorSelected = (event) => {
        setOperatorKey(event.target.value);
    }

    const observationsToBarData = (observations) => {
        if (valueKey === "" && operatorKey !== "Count") {
            return null;
        }

        return observations.map((observation, index) => {
            console.log(observation);
            const dateTime = new Date(Date.parse(observation.startDateTime));
            const collectorPerType = {
                name: dateTime.toLocaleDateString() + "\n" + dateTime.toLocaleTimeString()
            };

            if(operatorKey === "Count") {
                observation.geoObjects.forEach(geoObject => {
                    const { type } = geoObject;
                    if(!collectorPerType[type]) {
                        collectorPerType[type] = 0;
                    }
                    collectorPerType[type] += 1;
                });
            } else {
                const valuesByType = observation.geoObjects.reduce((accumulator, geoObject) => {
                    const { type } = geoObject;
                    if(!accumulator[type]) {
                        accumulator[type] = [];
                    }

                    if (geoObject.customAttributes[valueKey] && typeof geoObject.customAttributes[valueKey] === "number") {
                        accumulator[type].push(geoObject.customAttributes[valueKey]);
                    }

                    return accumulator;
                }, {});

                Object.entries(valuesByType).forEach(([type, values]) => {
                    switch (operatorKey) {
                        case "Add":
                            collectorPerType[type] = values.reduce((accumulator, value) => accumulator + value, 0)
                            break;
                        case "Average":
                            collectorPerType[type] = values.reduce((accumulator, value) => accumulator + value, 0) / values.length
                            break;
                        case "Min":
                            collectorPerType[type] = Math.min(...values);
                            break;
                        case "Max":
                            collectorPerType[type] = Math.max(...values);
                            break;
                        default:
                            break;
                    }
                })
            }
            console.log(collectorPerType)
            return collectorPerType;
        })
    }

    const data = observationsToBarData(observations);

    return (
        <div className='chart-module-container'>
            <div className="selectors">
                <FormControl sx={{ m: 1, minWidth: 120 }} size='small'>
                    <InputLabel id="operator-select-label">Operator</InputLabel>
                    <Select
                        labelId="operator-select-label"
                        id="operator-select"
                        value={operatorKey}
                        label="Operator"
                        onChange={handleOperatorSelected}
                    >
                        <MenuItem value="Add">Add</MenuItem>
                        <MenuItem value="Average">Average</MenuItem>
                        <MenuItem value="Min">Min</MenuItem>
                        <MenuItem value="Max">Max</MenuItem>
                        <MenuItem value="Count">Count</MenuItem>
                    </Select>
                </FormControl>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel id="field-select-label">Field</InputLabel>
                    <Select
                        labelId="field-select-label"
                        id="field-select"
                        value={valueKey}
                        label="Field"
                        onChange={handleFieldSelected}
                    >
                        <MenuItem value="">
                        <em>None</em>
                        </MenuItem>
                        {getCustomDataFields().map((field) => (
                            <MenuItem key={field} value={field}>{field}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            <div className='chart-container'>
                <ResponsiveContainer width="95%" height="95%" className={"chart-responsive-container"}>
                    { data === null || observations.length === 0 ? ("") : (
                        <BarChart width="85%" height="70%" data={data} className='chart'>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" height={70} tick={<CustomizedAxisTick /> } />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {Array.from(typeColors).map(([type, color]) => {
                                return <Bar key={type.toString()} dataKey={type.toString()} stackId={"a"} fill={color} />
                            })}
                            <Brush dataKey="name" height={20} stroke="#8884d8" />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>        
    );
}

class CustomizedAxisTick extends PureComponent {
  render() {
    const { x, y, payload } = this.props;

    return (
      <g transform={`translate(${x+30},${y})`}>
        <text x={0} y={0} dy={16} style={{whiteSpace: "pre-line"}} textAnchor="end" fill="#666">
            {payload.value}
        </text>
      </g>
    );
  }
}