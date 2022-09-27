import { Atom, AtomJson, fromJson, ToLatexOptions } from 'core/atom';
import { Box } from 'core/box';
import { GlobalContext, Context } from 'core/context';

/**
 * A group that represents a raw LaTeX editing zone.
 * There is only one LatexGroupAtom at a time in an expression.
 */
export class ChoiceAtom extends Atom {
  choices: Atom[][];

  constructor(choices: Atom[][], context: GlobalContext) {
    super('choice', context);
    this.choices = choices;
    this.skipBoundary = true;
  }

  static fromJson(json: AtomJson, context: GlobalContext): ChoiceAtom {
    return new ChoiceAtom(
      [
        fromJson(json.choices[0] as Atom[], context),
        fromJson(json.choices[1] as Atom[], context),
        fromJson(json.choices[2] as Atom[], context),
        fromJson(json.choices[3] as Atom[], context),
      ],
      context
    );
  }

  toJson(): AtomJson {
    const choices: AtomJson[][] = [];
    for (const choice of this.choices) {
      choices.push(
        choice.filter((x) => x.type !== 'first').map((x) => x.toJson())
      );
    }

    return { ...super.toJson(), choices };
  }

  render(context: Context): Box | null {
    const box = Atom.createBox(
      context,
      this.choices[Math.floor(context.mathstyle.id / 2)]
    );
    if (!box) return null;
    if (this.caret) box.caret = this.caret;
    // Need to bind the group so that the DOM element can be matched
    // and the atom iterated recursively. Otherwise, it behaves
    // as if `captureSelection === true`
    return this.bind(context, box);
  }

  serialize(options: ToLatexOptions): string {
    return `\\mathchoice{${Atom.serialize(
      this.choices[0],
      options
    )}}{${Atom.serialize(this.choices[1], options)}}{${Atom.serialize(
      this.choices[2],
      options
    )}}{${Atom.serialize(this.choices[3], options)}}`;
  }
}
