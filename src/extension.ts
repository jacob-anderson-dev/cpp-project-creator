import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// This is the activation function
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.generateProject', () => {
        // Get workspace folder
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('Please open a folder or workspace.');
            return;
        }

        const projectRoot = workspaceFolders[0].uri.fsPath;

        // Folders to create
        const folders = ['bin', 'src', 'include', 'lib'];

        folders.forEach(folder => {
            const folderPath = path.join(projectRoot, folder);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
        });

        // Generate Makefile
        const makefilePath = path.join(projectRoot, 'Makefile');
        const makefileContent = `
CXX         := g++
CXX_FLAGS   := -Wall -Wextra -ggdb -MMD -MP

BIN         := bin
SRC         := src
INCLUDE     := include
LIB         := lib
LIBRARIES   := 
EXECUTABLE  := main

SRC_EXT     := cpp
OBJ_EXT     := o
DEP_EXT     := d

SOURCES     := \$(wildcard \$(SRC)/*.\$(SRC_EXT))
OBJECTS     := \$(SOURCES:\$(SRC)/%.\$(SRC_EXT)=\$(BIN)/%.\$(OBJ_EXT))
DEPS        := \$(OBJECTS:.\$(OBJ_EXT)=.\$(DEP_EXT))

.PHONY: all clean run

all: \$(BIN)/\$(EXECUTABLE)

run: clean all
	clear
	./\$(BIN)/\$(EXECUTABLE)

\$(BIN)/\$(EXECUTABLE): \$(OBJECTS)
	\$(CXX) \$(CXX_FLAGS) -I\$(INCLUDE) -L\$(LIB) \$^ -o \$@ \$(LIBRARIES)

\$(BIN)/%.\$(OBJ_EXT): \$(SRC)/%.\$(SRC_EXT)
	@mkdir -p \$(BIN)
	\$(CXX) \$(CXX_FLAGS) -I\$(INCLUDE) -c \$< -o \$@

clean:
	-rm -f \$(BIN)/*.\$(OBJ_EXT) \$(BIN)/*.\$(DEP_EXT) \$(BIN)/\$(EXECUTABLE)

-include \$(DEPS)
        `;
        fs.writeFileSync(makefilePath, makefileContent);

        // Generate src/main.cpp
        const mainCppPath = path.join(projectRoot, 'src', 'main.cpp');
        const mainCppContent = `#include <iostream>

int main(int argc, char *argv[])
{
    std::cout << "Hello world!" << std::endl;
}`;
        fs.writeFileSync(mainCppPath, mainCppContent);

        vscode.window.showInformationMessage('Project structure, Makefile, and main.cpp created!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}