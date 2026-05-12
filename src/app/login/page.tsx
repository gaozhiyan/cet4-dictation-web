"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [studentId, setStudentId] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [classGroup, setClassGroup] = useState('A班')
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  // 构造虚拟邮箱，Supabase 默认必须有 email 格式，使用 .com 避免被判定为无效邮箱
  const getVirtualEmail = (id: string) => `${id}@student.dictation.com`

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const email = getVirtualEmail(studentId)

    if (isLoginMode) {
      // 登录
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message === 'Invalid login credentials' ? '学号或密码错误' : error.message)
      } else {
        router.push('/')
        router.refresh()
      }
    } else {
      // 注册
      if (!name) {
        setError("注册时必须填写姓名")
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            student_id: studentId,
            full_name: name,
            class_group: classGroup,
          }
        }
      })

      if (error) {
        setError(error.message)
      } else {
        // 由于是虚拟邮箱，不需要点击邮件验证，通常会直接登录成功
        setError('注册成功！正在进入系统...')
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 1000)
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden bg-[#f8fafc] p-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden relative z-10 p-8 md:p-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-sm">
            {isLoginMode ? '欢迎回来' : '注册账号'}
          </h1>
          <p className="text-slate-500 font-medium">
            {isLoginMode ? '登陆 航院CET4听写特训系统' : '加入 航院CET4听写特训系统'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleAuth}>
          <div className="space-y-2">
            <Label htmlFor="studentId" className="text-slate-700 font-bold ml-1">学号</Label>
            <Input 
              id="studentId" 
              type="text" 
              placeholder="请输入学号" 
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="bg-white/80 border-slate-200 rounded-2xl h-14 px-5 text-lg focus-visible:ring-4 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-400 transition-all shadow-sm placeholder:text-slate-300 font-medium"
                  required
                />
          </div>
          
          {!isLoginMode && (
            <>
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="name" className="text-slate-700 font-bold ml-1">姓名</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="请输入真实姓名" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/80 border-slate-200 rounded-2xl h-14 px-5 text-lg focus-visible:ring-4 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-400 transition-all shadow-sm placeholder:text-slate-300 font-medium"
                  required={!isLoginMode}
                />
              </div>
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2" style={{ animationDelay: '50ms' }}>
                <Label htmlFor="classGroup" className="text-slate-700 font-bold ml-1">班级</Label>
                <select
                  id="classGroup"
                  value={classGroup}
                  onChange={(e) => setClassGroup(e.target.value)}
                  className="w-full bg-white/80 border-2 border-slate-200 rounded-2xl h-14 px-5 text-lg focus-visible:ring-4 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-400 transition-all shadow-sm font-medium text-slate-700 outline-none"
                  required={!isLoginMode}
                >
                  <option value="A班">A班</option>
                  <option value="B班">B班</option>
                  <option value="港机4241">港机4241</option>
                  <option value="轮机4241">轮机4241</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 font-bold ml-1">密码</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/80 border-slate-200 rounded-2xl h-14 px-5 text-lg focus-visible:ring-4 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-400 transition-all shadow-sm placeholder:text-slate-300 font-medium"
                  required
                />
          </div>

          {error && (
            <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${error.includes('成功') ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {error}
            </div>
          )}
          
          <div className="pt-4">
            <Button 
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-indigo-500/30 rounded-2xl transition-all hover:-translate-y-1 text-white" 
              type="submit"
              disabled={loading}
            >
              {loading ? '处理中...' : (isLoginMode ? '立即登录' : '立即注册')}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <button 
            type="button"
            className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
            onClick={() => {
              setIsLoginMode(!isLoginMode)
              setError(null)
            }}
          >
            {isLoginMode ? (
              <>没有账号？ <span className="text-indigo-600">点击这里注册 &rarr;</span></>
            ) : (
              <>已有账号？ <span className="text-indigo-600">点击这里登录 &rarr;</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
