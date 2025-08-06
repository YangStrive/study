/**
 * TypeScript 装饰器详细示例
 * 装饰器本质上是一个函数，它可以修改类、方法、属性或参数的行为
 * 装饰器在编译时执行，可以通过反射或元数据来实现各种功能
 */

// 首先需要启用装饰器支持
// tsconfig.json 中需要设置 "experimentalDecorators": true

// 简化的元数据存储（替代 reflect-metadata）
const metadataStorage = new WeakMap<any, Map<string, any>>();

function setMetadata(key: string, value: any, target: any, propertyKey?: string) {
    const targetKey = propertyKey ? `${propertyKey}_${key}` : key;
    if (!metadataStorage.has(target)) {
        metadataStorage.set(target, new Map());
    }
    metadataStorage.get(target)!.set(targetKey, value);
}

function getMetadata(key: string, target: any, propertyKey?: string): any {
    const targetKey = propertyKey ? `${propertyKey}_${key}` : key;
    return metadataStorage.get(target)?.get(targetKey);
}

/**
 * 1. 方法装饰器示例
 * 方法装饰器接收三个参数：
 * @param target 类的原型对象
 * @param propertyKey 方法名
 * @param descriptor 方法的属性描述符
 */
function LogMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log('=== 方法装饰器被调用 ===');
    console.log('target:', target);
    console.log('propertyKey:', propertyKey);
    console.log('descriptor:', descriptor);
    
    // 保存原始方法
    const originalMethod = descriptor.value;
    
    // 修改方法的行为
    descriptor.value = function(...args: any[]) {
        console.log(`调用方法 ${propertyKey}，参数:`, args);
        
        // 调用原始方法
        const result = originalMethod.apply(this, args);
        
        console.log(`方法 ${propertyKey} 执行完成，返回值:`, result);
        
        return result;
    };
    
    return descriptor;
}

/**
 * 2. 计时装饰器 - 测量方法执行时间
 */
function Timer(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
        const startTime = performance.now();
        
        const result = originalMethod.apply(this, args);
        
        const endTime = performance.now();
        console.log(`方法 ${propertyKey} 执行时间: ${endTime - startTime}ms`);
        
        return result;
    };
    
    return descriptor;
}

/**
 * 3. 类装饰器示例
 * 类装饰器接收一个参数：构造函数
 * @param constructor 类的构造函数
 */
function Sealed(constructor: Function) {
    console.log('=== 类装饰器被调用 ===');
    console.log('constructor:', constructor);
    
    // 密封类和其原型，防止添加新属性
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}

/**
 * 4. 带参数的类装饰器 - 装饰器工厂
 */
function Component(config: { name: string; version: string }) {
    return function<T extends new (...args: any[]) => {}>(constructor: T) {
        console.log(`组件装饰器: 名称=${config.name}, 版本=${config.version}`);
        
        // 给类添加静态属性
        (constructor as any).componentName = config.name;
        (constructor as any).componentVersion = config.version;
        
        return constructor;
    };
}

/**
 * 5. 属性装饰器示例
 * 属性装饰器接收两个参数：
 * @param target 类的原型对象
 * @param propertyKey 属性名
 */
function ReadOnly(target: any, propertyKey: string) {
    console.log('=== 属性装饰器被调用 ===');
    console.log('target:', target);
    console.log('propertyKey:', propertyKey);
    
    // 定义属性描述符，使属性只读
    Object.defineProperty(target, propertyKey, {
        writable: false,
        configurable: false
    });
}

/**
 * 6. 参数装饰器示例
 * 参数装饰器接收三个参数：
 * @param target 类的原型对象
 * @param propertyKey 方法名
 * @param parameterIndex 参数索引
 */
function Required(target: any, propertyKey: string, parameterIndex: number) {
    console.log('=== 参数装饰器被调用 ===');
    console.log('target:', target);
    console.log('propertyKey:', propertyKey);
    console.log('parameterIndex:', parameterIndex);
    
    // 在实际应用中，可以结合元数据来实现参数验证
    const existingRequiredParameters = getMetadata('required-parameters', target, propertyKey) || [];
    existingRequiredParameters.push(parameterIndex);
    setMetadata('required-parameters', existingRequiredParameters, target, propertyKey);
}

/**
 * 7. 验证装饰器 - 配合参数装饰器使用
 */
function Validate(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
        // 获取必需参数的索引
        const requiredParameters: number[] = getMetadata('required-parameters', target, propertyKey) || [];
        
        // 验证必需参数
        for (const parameterIndex of requiredParameters) {
            if (args[parameterIndex] === undefined || args[parameterIndex] === null) {
                throw new Error(`参数 ${parameterIndex} 是必需的`);
            }
        }
        
        return originalMethod.apply(this, args);
    };
    
    return descriptor;
}

/**
 * 使用装饰器的示例类
 */
@Sealed                                    // 类装饰器：密封类
@Component({ name: 'UserService', version: '1.0.0' })  // 带参数的类装饰器
class UserService {
    @ReadOnly                              // 属性装饰器：使属性只读
    private readonly serviceName = 'UserService';
    
    constructor(private users: string[] = []) {}
    
    @LogMethod                             // 方法装饰器：记录方法调用
    @Timer                                 // 方法装饰器：计时
    getUserList(): string[] {
        // 模拟一些处理时间
        for (let i = 0; i < 1000000; i++) {
            // 空循环，模拟处理时间
        }
        return this.users;
    }
    
    @Validate                              // 验证装饰器
    addUser(@Required name: string, age?: number): void {  // 参数装饰器：标记必需参数
        console.log(`添加用户: ${name}, 年龄: ${age || '未知'}`);
        this.users.push(name);
    }
    
    @LogMethod
    removeUser(name: string): boolean {
        const index = this.users.indexOf(name);
        if (index > -1) {
            this.users.splice(index, 1);
            return true;
        }
        return false;
    }
}

/**
 * 装饰器执行顺序演示
 */
console.log('=== 开始创建类实例 ===');

// 创建实例
const userService = new UserService(['Alice', 'Bob']);

console.log('\n=== 调用方法 ===');

// 调用装饰过的方法
console.log('用户列表:', userService.getUserList());

console.log('\n=== 添加用户 ===');
try {
    userService.addUser('Charlie', 25);  // 正常调用
} catch (error) {
    console.error('错误:', error.message);
}

console.log('\n=== 参数验证测试 ===');
try {
    userService.addUser(null as any);    // 这将触发验证错误
} catch (error) {
    console.error('验证错误:', error.message);
}

console.log('\n=== 删除用户 ===');
console.log('删除结果:', userService.removeUser('Alice'));

console.log('\n=== 查看类的静态属性 ===');
console.log('组件名称:', (UserService as any).componentName);
console.log('组件版本:', (UserService as any).componentVersion);

/**
 * 装饰器工作原理总结：
 * 
 * 1. 装饰器本质上是函数，在编译时执行
 * 2. 装饰器的执行顺序：
 *    - 实例成员：参数装饰器 → 方法装饰器 → 属性装饰器
 *    - 静态成员：参数装饰器 → 方法装饰器 → 属性装饰器
 *    - 构造函数：参数装饰器
 *    - 类装饰器
 * 
 * 3. 多个装饰器的执行顺序：从下到上（就近原则）
 * 
 * 4. 装饰器可以：
 *    - 修改类的行为
 *    - 添加元数据
 *    - 实现AOP（面向切面编程）
 *    - 提供依赖注入
 *    - 实现验证和日志记录
 * 
 * 5. 常见应用场景：
 *    - 日志记录
 *    - 性能监控
 *    - 权限控制
 *    - 参数验证
 *    - 缓存机制
 *    - 依赖注入
 */

export { UserService }; 