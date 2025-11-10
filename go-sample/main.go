package main // パッケージ宣言（必須）

import "fmt" // インポート宣言

// 乱数のインポート
import (
	"math/rand"
)
// 乱数の取得 rand.Intn(n)
var a int = rand.Intn(100) 


func main() { // エントリーポイント
	fmt.Println("Hello, Go!")
	fmt.Println(a)
}
