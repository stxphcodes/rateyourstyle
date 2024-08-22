package main

import (
	"fmt"

	"github.com/lucasb-eyer/go-colorful"
)

func warmNeutralCool(color string) {

	RGB(255, 255, 0)

	yellow := colorful.Color{1.0, 1.0, 0.0} 
	//blue := colorful.Color{0, 0, 1.0}
	pink, _ := colorful.Hex("#FFC0CB")
	peach, _ := colorful.Hex("FFB07C")
	olive, _ := colorful.Hex("B8BC86")

	darkWarm, _ := colorful.Hex("#523524")
	darkNeutral, _ := colorful.Hex("#61311e")
	darkCool, _ := colorful.Hex("#552e20")

	c, err := colorful.Hex(color)
	if err != nil {

	}

	d1 := c.DistanceLab(yellow)
	d2 := c.DistanceLab((blue))
	d3 := c.DistanceLab(pink)
	d4 := c.DistanceLab(peach)
	d5 := c.DistanceLab(olive)

	fmt.Println(d1)
	fmt.Println(d2)
	fmt.Println(d3)
	fmt.Println(d4)
	fmt.Println(d5)
	fmt.Println(" ")

}
