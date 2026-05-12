import pandas as pd
import os

# Read CSV files
df_dingdan = pd.read_csv('/Users/gao/Desktop/others/CET4/摸底考试排名 - 订单班.csv')
df_feidingdan = pd.read_csv('/Users/gao/Desktop/others/CET4/摸底考试排名 - 非订单班.csv')

# Take top 40
df_dingdan_top40 = df_dingdan.head(40)
df_feidingdan_top40 = df_feidingdan.head(40)

# Generate LaTeX
latex_template = r"""
\documentclass{ctexart}
\usepackage{geometry}
\geometry{a4paper, margin=1in}
\usepackage{longtable}
\usepackage{booktabs}
\usepackage{hyperref}

\title{CET4 摸底考试分班报告}
\author{}
\date{\today}

\begin{document}

\maketitle

\section{概述}
本次摸底考试根据成绩对学生进行了分班。本报告列出了“订单班”和“非订单班”各自排名前40的学生名单。

\section{订单班前40名名单}

\begin{longtable}{llccc}
\toprule
\textbf{排名} & \textbf{姓名} & \textbf{班级} & \textbf{学号} & \textbf{总分} \\
\midrulimport pandas as pd
import os

# Read CSV files
df_ding()import os

# Read "'班级排df_dingdan = pd.notna(row['"班级排名"']) else '""'
    name = row['"姓名"']
    cls = row['"