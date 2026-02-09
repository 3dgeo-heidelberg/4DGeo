import './Notes.css';

export default function Chart({ observations, customObservationAttributeKeys }) {
    

    return (
        <div className='note-module-container'>
            <div className='note-settings'>
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
                        {customAttributeKeys.map((field) => (
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
                            <Tooltip itemStyle={{color: "black"}} />
                            <Legend formatter={renderColorfulLegendText} />
                            {Array.from(typeColors).map(([type, color]) => {
                                return (
                                    <Bar key={type.toString()} dataKey={type.toString()} stackId={"a"} fill={color} onClick={onBarClick}>
                                        {data.map((entry, index) => (
                                            <Cell cursor="pointer" stroke={index === selectedBarIndex ? 'red' : ''} key={`cell-${index}`} />
                                        ))}
                                    </Bar>
                                )
                            })}
                            <Brush dataKey="name" height={20} stroke="#8884d8" />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>        
    );
}