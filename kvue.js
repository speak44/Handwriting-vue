
// 在 03-kvue.html 中数据发生频繁变化的时候，data 没有获取到。
// setInterval(() => {
//   app.counter++ 
//   //是因为在这里的时候，它直接修改的是，app里面的内容，进行的赋值，而上面在class KVue 中，响应式处理的是data的，observe(this.$data)
// }, 1000);
// 如果想要看效果，只能将app.counter++ ，修改为 app.$data.counter++
// 代理 data中的数据
function proxy(vm){
  Object.keys(vm.$data).forEach(key=>{ //将data的每一项遍历，进行数据修改和获取拦截处理
    Object.defineProperty(vm,key,{
      get(){
        return vm.$data[key]
      },
      set(v){ //新值赋值
        vm.$data[key]=v
      }
    })
  })
}




//  new Vue({})  所以先生成一个class类
  class KVue {
    constructor(options){
      // 保存选项
      this.$options =options
      this.$data = options.data // 数据拦截是，传进来的data，里的数据进行了响应式处理
      // 响应式处理
      observe(this.$data)
      // 当修改的的形式是 app.counter++
      proxy(this)
      // Compiler: 编译器  解析模版 找到依赖； 和前面拦截的的属性，进行拦截。
      new Compiler('#app', this)
    }
  }
// 对象的所有属性进行拦截
function observe(obj){
  if(typeof obj !== 'object' || obj==null){
    return
  }
  // 创建一个observer实例对象，目的是：出现一个对象就有一个observer的实例
  new Observer(obj)
}

// 负责数据响应化
// 首先执行数据响应式，当数据进来的时候，让它通过get 和set 的方法，进行监听修改；
// 当数据发生改变的时候可以检测到，当获取的时候可以做拦截，从而达到数据响应式
class Observer{
  constructor(value){  //  接收一个值 
    //
    this.value=value
    // 拦截下value
    this.walk(value)
  }

  // 遍历对象做响应式
  walk(obj) {
    Object.keys(obj).forEach((key)=>{
      defineReactive(obj,key,obj[key])
    })
  }
}
 //数据进行响应式处理
function defineReactive(obj,key,val){
  observe(val)
  Object.defineProperty(obj,key,{
    get(){
      console.log('get', val)
      return val
    },
    set(newVal){
      if(newVal!==val){
        console.log('set', newVal)
        observe(newVal) // 如果赋值的是对象的化，还需要递归进行数据响应式处理
        val =newVal
      }
    }
  })
}


// 在 03-kvue.html 中数据发生频繁变化的时候，data 没有获取到。
// setInterval(() => {
//   app.counter++ 
//   //是因为在这里的时候，它直接修改的是，app里面的内容，进行的赋值，而上面在class KVue 中，响应式处理的是data的，observe(this.$data)
// }, 1000);
// 如果想要看效果，只能将app.counter++ ，修改为 app.$data.counter++

// Compiler: 编译器  解析模版 找到依赖； 和前面拦截的的属性，进行拦截。
// new Compiler('#app', wv)  // 参数为： 宿主元素 （需要遍历结构） ， 当前实例
class Compiler {
  constructor(el,vm){
    this.$vm =vm
    this.$el = document.querySelector(el)
    // 执行编译
    this.compiler(this.$el)
  }
  // 将dome元素上的节点进行遍历 
  // <div id="app">
  //   <p>{{counter}}</p>
  //   </div>
  compiler(el){
    console.log( el.childNodes, ' el.childNodes')
    el.childNodes.forEach(node =>{
      //是否是元素
      if(node.nodeType === 1){
        console.log('元素', node.nodeName)
      }else if(this.isIner(node)){ //插值，双括号{{}}
        console.log('编译文本', node.textContent)
      }
      // 递归，根元素 里面还有子元素
        if(node.childNodes){
          this.compiler(node)
        }
    })
  }
  // 文本节点 {{111222}}
  isIner(node){
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }
}
