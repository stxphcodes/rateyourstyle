package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

const create string = `
CREATE TABLE IF NOT EXISTS outfits (
	id INTEGER NOT NULL PRIMARY KEY,
	data JSON
)`

func main() {
	if err := run(); err != nil {
		log.Fatalf(err.Error())
	}

}

func run() error {
	db, err := sql.Open("sqlite3", "foo.db")
	if err != nil {
		return err
	}

	// _, err = db.Exec(create)
	// if err != nil {
	// 	return err
	// }

	bytes, err := os.ReadFile("/Users/huangs4/go/src/github.com/rateyourstyle/server/data/outfits/00000002.json")
	if err != nil {
		return err
	}

	// insert
	stmt, err := db.Prepare("INSERT INTO outfits(data) values (?)")
	if err != nil {
		return err
	}

	_, err = stmt.Exec(bytes)
	if err != nil {
		return err
	}

	// query
	// rows, err := db.Query("SELECT * FROM outfits")
	// if err != nil {
	// 	return err
	// }

	// // checkErr(err)
	// var id int
	// var data []byte

	// for rows.Next() {
	// 	err = rows.Scan(&id, &data)
	// 	if err != nil {
	// 		return err
	// 	}
	// 	fmt.Println(id)
	// 	fmt.Println(data)
	// 	fmt.Println(string(data))
	// }

	// rows.Close() //good habit to close

	// query
	querystr := "%" + "city%"
	rows, err := db.Query(`SELECT 
	json_extract(data, '$.description') AS description
	FROM outfits, json_each(outfits.items)
	WHERE json_each.value.brand like ?
	`, querystr)
	if err != nil {
		return err
	}

	// checkErr(err)
	var description string

	for rows.Next() {
		err = rows.Scan(&description)
		if err != nil {
			return err
		}
		fmt.Println(description)
	}

	rows.Close() //good habit to close

	db.Close()

	return nil
}
