#pragma once
#include "stdint.h"
#include "new.hpp"
#include "memory.hpp"
#include "assert.hpp"

template <typename T>
class Matrix
{
public:
    Matrix()
        :
        n_rows_(0),
        n_cols_(0),
        data_(nullptr)
    {}
    Matrix(const Matrix& other)
        :
        n_rows_(other.n_rows_),
        n_cols_(other.n_cols_),
        data_(new T[n_rows_ * n_cols_])
    {
        for(std::size_t i = 0; i < n_rows_*n_cols_; i++)
        {
            data_[i] = other.data_[i];
        }
    }

    Matrix(std::size_t nrows, std::size_t ncols, const std::initializer_list<T>& data)
        :
        n_rows_(nrows),
        n_cols_(ncols),
        data_(new T[n_rows_ * n_cols_])
    {
        for(std::size_t i = 0; i < n_rows_*n_cols_; i++)
        {
            data_[i] = *(data.begin() + i);
        }
    }

    Matrix(std::size_t nrows, std::size_t ncols)
        :
        n_rows_(nrows),
        n_cols_(ncols),
        data_(new T[n_rows_ * n_cols_])
    {
        ZeroMatrix();
    }
    Matrix(Matrix&& m)
        :
        n_rows_(m.n_rows_),
        n_cols_(m.n_cols_),
        data_(m.data_)
    {
        n_rows_ = 0;
        n_cols_ = 0;
        data_ = nullptr;
    }

    Matrix& operator=(const Matrix& rhs)
    {
        if(this == rhs) return *this;

        Matrix cpy{rhs};

        *this = std::move(cpy);

        return *this;
    }

    Matrix& operator=(Matrix&& rhs)
    {
        if(this == &rhs) return *this;

        n_cols_ = rhs.n_cols_;
        n_rows_ = rhs.n_rows_;
        data_ = rhs.data_;

        rhs.n_cols_ = 0;
        rhs.n_rows_ = 0;
        rhs.data_ = nullptr;

        return *this;
    }

    ~Matrix()
    {
        ClearMemory();
    }

    Matrix operator+(const Matrix& rhs) const
    {
        Matrix<T> res{rhs.n_rows_, rhs.n_cols_};

        for(std::size_t i = 0; i < rhs.n_cols_*rhs.n_rows_; i++)
        {
            res.data_[i] = data_[i] + rhs.data_[i];
        }

        return res;
    }

    Matrix operator*(const Matrix& rhs)
    {
        assert(n_cols_ == rhs.n_rows_);

        Matrix<T> res{n_rows_, rhs.n_cols_};

        for(std::size_t i = 0; i < n_rows_; i++)
        {
            for(std::size_t j = 0; j < n_cols_; j++)
            {
                for(std::size_t k = 0; k < n_cols_; k++)
                {
                    res(i, j) += (*this)(i, k) * rhs(k, j);
                }
            }
        }

        return res;
    }

    T operator()(std::size_t row, std::size_t col) const
    {
        return data_[(row*n_cols_) + col];
    }

    T& operator()(std::size_t row, std::size_t col)
    {
        return data_[(row*n_cols_) + col];
    }

private:
    void ClearMemory()
    {
        n_rows_ = 0;
        n_cols_ = 0;
        delete[] data_;
        data_ = nullptr;
    }

    void ZeroMatrix()
    {
        for(std::size_t i = 0; i < n_cols_ * n_rows_; i++)
        {
            data_[i] = 0;
        }
    }

private:
    std::size_t n_rows_;
    std::size_t n_cols_;
    T* data_;

};

using MatrixD = Matrix<double>;
using MatrixF = Matrix<float>;
