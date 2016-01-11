$(document).ready(function() {
  application.init()
  application.drawDonut('#pasja-art', [{ label: 'html', count: 40 }, { label: 'css', count: 40 }, { label: 'javascript', count: 20 }] )
  application.drawDonut('#labarum', [{ label: 'html', count: 40 }, { label: 'css', count: 40 }, { label: 'javascript', count: 20 }] )
  application.drawDonut('#interaktywni', [{ label: 'html', count: 35 }, { label: 'css', count: 35 }, { label: 'javascript', count: 30 }] )
  application.drawDonut('#striketech', [{ label: 'html', count: 30 }, { label: 'css', count: 30 }, { label: 'javascript', count: 40 }] )
})

var application = {
  init: function() {
    this.events()
  }
  , hoverDonut: function(e) {
    var classElement = $(e.target).attr('class')

    switch(classElement) {
      case 'html':
        $('.donut-charts').find('.legend:nth-of-type(1)').css('display', 'block')
        $('.chart').css('transform', 'rotate(15deg)')
        $('.legend').css('transform', 'rotate(-15deg)')
        break
      case 'css':
        $('.donut-charts').find('.legend:nth-of-type(2)').css('display', 'block')
        $('.chart').css('transform', 'rotate(20deg)')
        $('.legend').css('transform', 'rotate(-20deg)')
        break
      case 'js':
        $('.donut-charts').find('.legend:nth-of-type(3)').css('display', 'block')
        $('.chart').css('transform', 'rotate(25deg)')
        $('.legend').css('transform', 'rotate(-25deg)')
        break
    }
  }
  , unhoverDonut: function(e) {
    var classElement = $(e.target).attr('class')

    switch(classElement) {
      case 'html':
        $('.donut-charts').find('.legend:nth-of-type(1)').css('display', 'none')
        $('.chart').css('transform', 'rotate(0deg)')
        break
      case 'css':
        $('.donut-charts').find('.legend:nth-of-type(2)').css('display', 'none')
        $('.chart').css('transform', 'rotate(0deg)')
        break
      case 'js':
        $('.donut-charts').find('.legend:nth-of-type(3)').css('display', 'none')
        $('.chart').css('transform', 'rotate(0deg)')
        break
    }
  }
  , drawDonut: function(id, data) {
    var dataset = data
    var width = 240
    var height = 240
    var radius = Math.min(width, height) / 2
    var legendRectSize = 100
    var legendSpacing = 0
    var donutWidth = 75

    var color = d3.scale.ordinal()
      .range([ '#dc714a', '#edab3b', '#7B5F61' ])

    var svg = d3.select(id)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')')

    var arc = d3.svg.arc()
      .innerRadius(radius - 70)
      .outerRadius(radius)

    var pie = d3.layout.pie()
      .value(function(d) { return d.count })
      .sort(null)

    var path = svg.selectAll('path')
      .data(pie(dataset))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', function(d, i) {
        return color(d.data.label)
      })
      .attr('stroke', 'white')
      .attr('stroke-width', '4')

    var legend = svg.selectAll('.legend')
      .data(color.domain())
      .enter()
      .append('g')
      .attr('class', 'legend')
      .style('display', 'none')
      .attr('transform', function(d, i) {
        var height = legendRectSize + legendSpacing
        var offset =  height * color.domain().length / 2
        var horz = 0
        var vert = 0
        return 'translate(' + horz + ',' + vert + ')'
      })

    legend.append('circle')
      .attr('r', legendRectSize)
      .style('fill', color)
      .style('stroke', 'white')
      .style('stroke-width', '4')

    legend.append('text')
      .data(dataset)
      .attr('x', '-50')
      .attr('y', '25')
      .attr('font-size', '70')
      .attr('fill', 'white')
      .text(function(d) { return d.count })

    legend.append('text')
      .attr('x', '20')
      .attr('y', '0')
      .attr('font-size', '35')
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .text('%')
  }
  , events: function() {
    var self = this

    $('li').mouseenter(function(e) {
      self.hoverDonut(e)
    })

    $('li').mouseleave(function(e) {
      self.unhoverDonut(e)
    })
  }
}
