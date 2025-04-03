---
title: "TypeScript 컴파일러 옵션 설정하기 (tsconfig.json)"
category: "Dev"
date: "2023-07-12 12:00:00 +09:00"
desc: "TypeScript 컴파일러 옵션 설정 방법에 대한 포스트입니다."
thumbnail: "./images/code-block/ts.png"
alt: "code block graphic"
---

TypeScript는 다른 언어에 비해 컴파일 옵션을 간단하게 설정할 수 있어요.

## 컴파일러 옵션 초기화

먼저 컴파일러 옵션 파일을 생성해볼게요.
터미널에 다음과 같이 입력하면 돼요.

```json
$ tsc --init
```

이렇게 입력해주면 현재 경로에 tsconfig.json이라는 파일이 생성돼요.
파일을 열어보면 다음과 같이 기본값으로 설정값들이 초기화되어있는 것을 확인할 수 있어요.

![](https://velog.velcdn.com/images/jungwoo3490/post/18c2dcbe-a216-4286-852e-88aff75f21f8/image.png)

사진과 같이 대부분이 주석처리되어있는 것을 확인할 수 있어요.
초기 설정을 위해 기본 설정값들을 다 지워볼게요.

## 1. "include":

기본적으로 tsc를 사용하여 컴파일을 하려면 한 번에 하나의 파일만 컴파일이 가능해요.
하지만 파일이 수백개라면 어떨까요...? 일일이 하나하나 수정하고 컴파일하기 굉장히 번거로울 거예요.

```json
{
  "include": ["src"]
}
```

이렇게 작성해주면 tsc만 터미널에 작성해주어도 src 디렉터리 아래에 있는 모든 ts 파일들이 컴파일돼요.

## 2. "compilerOptions":

컴파일러의 세부적인 옵션을 설정하는 여러 옵션들이 포함되는 부분이에요.<br/>
주로 컴파일 후 생성되는 JS 파일을 설정하는 옵션들이 compilerOptions 안에 포함되게 돼요.

## 3. "target":

컴파일 결과 생성되는 자바스크립트 버전을 설정하는 옵션이에요.<br/>
target 옵션은 compilerOptions 내부에 작성해주어야 해요.<br/>
(참고로 ESNext는 자바스크립트 최신 버전을 의미해요.)

```json
{
  "compilerOptions": {
    "target": "ESNext"
  }
}
```

## 4. "module":

컴파일 결과 변환된 자바스크립트 코드의 모듈 시스템을 설정하는 옵션이에요.<br/>
module 옵션은 compilerOptions 내부에 작성해주어야 해요.

```json
{
  "compilerOptions": {
    "module": "ESNext"
  }
}
```

실제로 module을 ES5로 지정하고 ts 파일에 화살표 함수를 작성한 뒤 컴파일하면 컴파일 결과 생성되는 JS 파일에 있는 함수가 함수 표현식으로 변환돼요. 화살표 함수는 ES5 문법에서 지원하지 않기 때문이에요.

```json
// tsconfig.json

{
  "compilerOptions": {
    "module": "ES5"
  }
}
```

위와 같이 설정 파일을 작성하고

```typescript
// index.ts

const func = () => console.log("Hello")
```

위와 같이 화살표 함수를 작성한 후 컴파일하면

```javascript
// index.js

var func = function () {
  return console.log("Hello")
}
```

다음과 같이 함수 표현식으로 변환되는 것을 확인할 수 있어요.

## 5. "outDir":

TS 파일을 컴파일하게 되면 TS 파일과 동일한 경로에 컴파일 결과 JS 파일이 생성돼요.</br>
하지만 TS 파일이 매우 많다면 어떨까요? 컴파일 후 해당 경로에 위치한 파일이 매우 많고 복잡해지겠죠.</br>

outDir은 컴파일 결과 생성되는 자바스크립트 파일의 생성 위치를 지정하는 옵션이에요.<br/>
outDir 옵션은 compilerOptions 내부에 작성해주어야 해요.

```json
{
  "compilerOptions": {
    "outDir": "dist"
  }
}
```

다음과 같이 작성하게 되면 컴파일 시 dist라는 폴더에 컴파일 결과 JS 파일들이 위치하게 돼요.<br/>
만약 지정해준 이름의 폴더가 존재하지 않을 시 해당 이름의 폴더를 자동 생성한 후 컴파일 결과 파일을 위치시키게 돼요.

## 6. "strict":

TypeScript 컴파일러가 타입을 얼마나 엄격하게 검사할지 설정하는 옵션이에요.</br>

```typescript
export const hello = message => {
  console.log("hello" + message)
}
```

이 코드는 눈으로 봐서는 전혀 문제가 없어보이죠. 실제로 에디터에서도 오류로 감지하는 부분이 전혀 없어요.</br>
tsconfig,json에 다음과 같이 옵션을 설정해보자.

```json
{
  "compilerOptions": {
    "strict": "true"
  }
}
```

그러면 신기하게도 hello 함수에 오류가 발생하게 돼요. 오류가 발생하는 부분은 매개변수로 받은 message 부분이에요.<br/>
TypeScript에서는 매개변수의 타입을 사람이 직접 지정하도록 권장해요. 매개변수의 타입은 컴파일러가 추론할 수 없기 때문이에요.<br/>
위와 같이 추론이 되지 않는 변수의 타입을 명시하지 않으면 strict 옵션을 true로 설정했을 때 오류가 발생하게 돼요.<br/>
반대로 strict 옵션을 false로 설정하면 엄격한 검사를 하지 않으므로 오류가 발생하지 않게 돼요.

strict 옵션은 compilerOptions 내부에 작성해주어야 해요.

## 7. "moduleDetection":

두 개의 TypeScript 파일에 동일한 이름의 변수를 각각 선언하면 오류가 발생하게 돼요.<br/>
JavaScript에서는 분명 파일별로 동일한 이름의 변수를 각각 작성해도 아무런 문제가 발생하지 않았죠.<br/>
왜 이런 오류가 발생하는 것일까요?

JavaScript는 모든 파일을 개별 모듈로 취급하기 때문에 각 파일마다 동일한 이름의 변수를 선언해도 문제가 되지 않아요.<br/>
이에 반해, TypeScript는 기본적으로 모든 TypeScript 파일을 전역 모듈로 취급해요. 그래서 각기 다른 파일에 선언한 변수도 동일한 스코프 내에 있다고 판단하여 오류가 발생한 것이에요.

이를 해결할 수 있는 방법이 있는데, 바로 import, export 같은 모듈 시스템 키워드를 이용하는 것이에요.<br/>
모듈 시스템을 이용하는 키워드를 파일 내에 1번 이상 작성하면 그 파일은 독립된 모듈로 취급돼요.<br/>
따라서, 모든 파일마다 모듈 시스템 키워드를 억지로 끼워넣으면 모든 파일이 개별 모듈로 취급되게 됩니다.<br/>

하지만, 모든 파일마다 일일히 모듈 시스템 키워드를 추가해주는 것은 상당히 번거로운 일이겠죠.<br/>
이럴 때 쉽게 해결할 수 있는 방법은 moduleDetection 옵션을 이용하는 것이에요.<br/>
moduleDetection 옵션은 TypeScript가 각각의 파일을 어떤 모듈로 감지할 것인지를 결정하는 옵션이에요.<br/>
tsconfig.json에 다음과 같이 작성해볼게요.

```json
{
  "compilerOptions": {
    "moduleDetection": "force"
  }
}
```

이렇게 설정하면 신기하게도 중복 선언 오류가 사라지게 돼요.<br/>
왜 오류가 사라졌는지는 TS 파일을 컴파일해보면 알 수 있어요. 컴파일 결과 JS 파일을 열어보면 다음과 같은 모듈 시스템 키워드가 원본 코드에 자동으로 추가되어 있는 것을 볼 수 있어요.

```javascript
export {}
```

moduleDetection 옵션을 force로 설정하게 되면, 컴파일 시 타입스크립트 컴파일러가 모듈 시스템을 사용하는 키워드를 자동으로 추가해줘요.<br/>
이렇게 하면 모든 TypeScript 파일이 개별 모듈로 취급받게 됩니다.

## 8. "ts-node":

일반적인 TypeScript 컴파일 과정을 살펴보면, TypeScript 컴파일러가 TS 파일을 AST(추상 문법 트리)로 변환한 뒤, AST에 대해 타입 검사를 실시하여 오류가 없다면 JS 파일로 변환시켜요. 그 뒤 JS 컴파일러가 JS 파일을 AST(추상 문법 트리)로 변환한 뒤, AST를 바이트 코드로 변환하여 실행하는 방식이에요. 즉, TS 파일을 실행까지 시키기 위해서는 TS 파일을 컴파일 하여 JS 파일로 변환하고, 변환된 JS 파일을 다시 컴파일해야 해요.<br/>
하지만 2번 컴파일해야 한다는 점이 번거로울 수 있어요. 이를 위해 ts-node라는 편리한 모듈이 존재해요. ts-node를 사용해 TS 파일을 컴파일하면 바로 실행까지 시켜줍니다.

앞선 옵션에서 module 옵션을 ESNext로 설정하고 ts-node를 사용하여 컴파일하면 오류가 발생하게 돼요. 오류가 발생하는 이유는 ts-node는 기본적으로 CommonJS를 사용하기 때문에 ES 모듈 시스템을 이해하지 못하기 떄문이에요.

이를 해결하기 위해서는 tsconfig.json에서 ts-node를 위한 옵션을 추가해주면 돼요.<br/>
tsconfig.json에 다음과 같이 작성해보자.

```json
{
  "ts-node": {
    "esm": "true"
  }
}
```

이렇게 설정해주면 ts-node가 ES 모듈 시스템으로 동작하게 돼요.
