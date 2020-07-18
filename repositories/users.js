const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const scrypt = util.promisify(crypto.scrypt);

class UserRepository {
    constructor(filename) {
        if (!filename) {
            throw new Error('Creating a reposityr required a file');
        }

        this.filename = filename;  

        try {
            fs.accessSync(this.filename) 
        } catch (err) {
            fs.writeFileSync(this.filename, '[]')
        }
    }

    async getAll() {
        return JSON.parse(
            await fs.promises.readFile(this.filename, {
                encoding: 'utf8'
            })
        );
    }

    async create(attrs) {
        // attrs === {email: ', password: '}
        
        attrs.id = this.randomId();

        const salt = crypto.randomBytes(8).toString('hex');
        const buf = await scrypt(attrs.password, salt, 64);

        const records = await this.getAll();
        const record = {
            ...attrs,
            password: `${buf.toString('hex')}.${salt}`
        }
        records.push(record);

        await this.writeAll(records);

        return record;
    }

    async writeAll(records) {
        await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
    }

    async getOne(id) {
        const records = await this.getAll();
        return records.find(record => record.id === id);
    }

    randomId() {
        return crypto.randomBytes(5).toString('hex');
    }
    
    async delete(id) {
        const records = await this.getAll();
        const filteredRecords = records.filter(record => record.id !== id)
        await this.writeAll(filteredRecords);
    }

    async update(id, attrs) {
        const records = await this.getAll();

        const record = records.find(record => record.id === id);

        if(!record) {
            throw new Error(`Record with id ${id} not found`);
        }

        Object.assign(record, attrs);
        await this.writeAll(records)
    }

    async comparePasswords(saved, supplied) {
        const [hashed, salt] = saved.split('.');
        const hashedSuppliedBuf = await scrypt(supplied, salt, 64);

        return hashed === hashedSuppliedBuf.toString('hex');
    }

    async getOneBy(filters) {
        const records = await this.getAll();
    
        for (let record of records) {
          let found = true;
    
          for (let key in filters) {
              //key = password
                //filters[key] = mypassword
            if (record[key] !== filters[key]) {
              found = false;
            }
          }
    
          if (found) {
            return record;
          }
        }
      }
}

// const test = async () => {
//     const repo = new UserRepository('users.json');

//     //await repo.update('64ab6aa61a', { password: 'mypassowrd' });
//     //await repo.getOneBy({ email: 'test@test.com' ,password: 'mypassword' })
//     const user = await repo.getOneBy({ email: 'text@test.com', password : "mypassowrd" });
    
//     console.log(user)
// }

// test();
module.exports = new UserRepository('users.json');