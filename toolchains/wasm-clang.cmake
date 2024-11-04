set(CMAKE_SYSTEM_NAME Linux)

set(CMAKE_C_COMPILER "/usr/bin/clang")
set(CMAKE_CXX_COMPILER "/usr/bin/clang++")

add_definitions(-DWASM)
set(WASM 1)

# set(CMAKE_CXX_FLAGS "-fno-builtin --target=wasm32 --no-standard-libraries ")

# # -Wl,--export=update_screen_buffer -Wl,--export=get_screen_buffer 

# set(CMAKE_C_FLAGS "-fno-builtin --target=wasm32 --no-standard-libraries -O2")

# set(CMAKE_EXE_LINKER_FLAGS "-Wl,--no-entry -Wl,--allow-undefined -Wl,--export-all")
