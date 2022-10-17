function main() {
  const req = fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
    .then(response => response.json())
    .then(response => {
      console.log(response)
      graph(response)
    })
}

const graph = (response) => {
  
  const colors = [
    '#313695', '#4575B4', '#74ADD1', '#ABD9E9', '#E0F3F8', 
    '#FFFFB9', '#FEE090', '#FDAE61', '#F46D43', '#D73027', 
    '#85001F'
]

  let data = response.monthlyVariance
  for (let i = 0; i < data.length; i++){
    data[i]['temp'] = Number((data[i].variance + 8.66).toFixed(3))
  }
    
  console.log(data)
  
  const minYear = d3.min(data, d => d.year)
  const maxYear = d3.max(data, d => d.year)

  /*Variables de ancho, alto y padding del canvas*/
  const w = 1400;
  const h = 600;
  const padding = 100;
  const barwidth = (w - 2*padding) / (maxYear - minYear)
  const barheight = (h - 2*padding) / 12

  /*Definción de escalas*/
  const xScale = d3.scaleLinear()
    .domain([minYear-0.2, maxYear+1])
    .range([padding, w - padding]);

  const yScale = d3.scaleLinear()
    .domain([11.5,-0.5])
    .range([padding, h - padding])

  

  /*Definición de ejes*/
  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.format('d'))

  const yAxis = d3.axisLeft(yScale)
    .tickFormat(month => {
      const date = new Date()
      date.setUTCMonth(month)
      return d3.timeFormat('%B')(date)
    })

  /*Tooltip*/
  const tooltip = d3.select('.grafico')
    .append('div')
    .attr('id','tooltip')
    .style("position", "absolute")
    .style("visibility", "hidden")

  /*Canvas*/
  const svg = d3.select('.grafico')
  .append('svg')
  .attr('width', w)
  .attr('height', h)
  
  /*Título y subtítulo*/
  d3.select('#title')
    .text('Monthly Global Land-Surface Temperature')

  d3.select('#description')
    .text("1753 - 2015: base temperature 8.66℃")

  /*Graficado de ejes*/
  svg.append('g')
    .attr('class', 'axis')

  svg.select('.axis')
    .append('g')
    .attr('id','x-axis')
    .attr('transform', `translate(0,${h - 1.5*padding})`)
    .call(xAxis)

  svg.select('.axis')
    .append('g')
    .attr('id','y-axis')
    .attr('transform', `translate(${padding},${-0.5*padding})`)
    .call(yAxis)

  /*Texto ejes*/
  svg.append('g')
    .attr('class','axis-texts')

  svg.select('.axis-texts')
    .append('text')
    .attr('x', -255)
    .attr('y', 30)
    .attr('transform', 'rotate(-90)')
    .text('Months')

  svg.select('.axis-texts')
    .append('text')
    .attr('x', 676)
    .attr('y', 500)
    .text('Years')

  /*Graficado de barras*/
  svg.append('g')
    .attr('class', 'rects')
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('data-month', d => d.month - 1)
    .attr('data-year', d => d.year)
    .attr('data-temp', d => d.temp)
    .attr('x', (d) => xScale(d.year))
    .attr('y', (d) => yScale(d.month-1)-0.5*padding - barheight/2 - 1)
    .attr('width', barwidth)
    .attr('height', barheight)
    .attr('fill', d => {
      switch(true){
        case (d.temp < 2.8): return colors[0] 
        case (d.temp < 3.9): return colors[1]
        case (d.temp < 5.0): return colors[2] 
        case (d.temp < 6.1): return colors[3] 
        case (d.temp < 7.2): return colors[4] 
        case (d.temp < 8.3): return colors[5] 
        case (d.temp < 9.5): return colors[6] 
        case (d.temp < 10.6): return colors[7]
        case (d.temp < 11.7): return colors[8]
        case (d.temp < 12.8): return colors[9]
        case (d.temp > 12.8): return colors[10]
      }
    })
    .on('mouseover', (d) => {
      const date = new Date();
      date.setMonth(d.target.__data__.month - 1)
      tooltip.attr('data-year', d.target.__data__.year)
        .style("visibility", "visible")
        .html(d.target.__data__.year + ' - ' + date.toLocaleString('en', {month: 'long'}) + '<br>' +
        'Temp: ' + d.target.__data__.temp.toFixed(1) + ' °C<br>' +
        'Variance: ' + d.target.__data__.variance.toFixed(1) + ' °C<br>')
    })
    .on("mousemove", (d) => {
      tooltip.style("top", (d.pageY-90)+"px").style("left",(d.pageX-55)+"px");
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
  });

  /*Legend*/
  const threshold = d3.scaleThreshold()
    .domain([0,2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8,])
    .range([,colors[0], colors[1], colors[2], colors[3], colors[4], 
      colors[5], colors[6], colors[7], colors[8], colors[9], colors[10]]);

  const legendScale = d3.scaleLinear()
    .domain([0,15.6])
    .range([padding, w - padding ]);

  const legendAxis = d3.axisBottom(legendScale)
    .tickSize(20)
    .ticks(30)
    .tickValues(threshold.domain())

  svg.append("g")
    .attr('id', 'legend')
    .attr('transform', `translate(0,540)`)
    .call(legendAxis);

  svg.select('#legend').selectAll("rect")
    .data(threshold.range().map((color) => {
      const d = threshold.invertExtent(color);
      if (d[0] == null) {
        d[0] = legendScale.domain()[0]
      }
      if (d[1] == null) {
        d[1] =  legendScale.domain()[1];
      }
      return d;
    }))
    .enter().insert('rect', '.tick')
    .attr('height', 10)
    .attr('x', (d) => legendScale(d[0]))
    .attr('width', (d) => legendScale(d[1]) - legendScale(d[0]))
    .attr('fill', (d) => threshold(d[0]));

}